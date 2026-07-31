package contract

import (
	"fmt"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// DefaultBaselineOpenAPIPath is the checked-in accepted contract used for
// semantic breaking-change detection. Update procedure:
//  1. Intentionally revise contracts/openapi.v1.yaml
//  2. Ensure additive/non-breaking diffs pass ValidateNoBreakingChanges
//  3. For accepted intentional contract evolution (including additive publish),
//     copy openapi.v1.yaml over openapi.v1.baseline.yaml in the same change
//  4. Re-run go test ./internal/contract/
const DefaultBaselineOpenAPIPath = "contracts/openapi.v1.baseline.yaml"

// BreakingChange is one deterministic semantic regression between baseline and candidate.
type BreakingChange struct {
	Operation string
	Kind      string
	Detail    string
}

func (b BreakingChange) String() string {
	return fmt.Sprintf("%s: %s (%s)", b.Kind, b.Detail, b.Operation)
}

// ValidateNoBreakingChanges compares candidate against baseline and rejects
// meaningful contract regressions for /api/v1 operations.
func ValidateNoBreakingChanges(baseline, candidate *OpenAPIContract) error {
	changes := DiffBreakingChanges(baseline, candidate)
	if len(changes) == 0 {
		return nil
	}
	msgs := make([]string, 0, len(changes))
	for _, change := range changes {
		msgs = append(msgs, change.String())
	}
	sort.Strings(msgs)
	return fmt.Errorf("semantic breaking API contract changes:\n  - %s", strings.Join(msgs, "\n  - "))
}

// DiffBreakingChanges returns deterministic breaking diffs for /api/v1 ops.
func DiffBreakingChanges(baseline, candidate *OpenAPIContract) []BreakingChange {
	var out []BreakingChange

	baseOps := indexOperations(baseline.Doc)
	candOps := indexOperations(candidate.Doc)

	var keys []string
	for key := range baseOps {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	for _, key := range keys {
		_, path, _ := strings.Cut(key, "\t")
		if !IsAPIV1(path) {
			continue
		}
		base := baseOps[key]
		cand, ok := candOps[key]
		if !ok {
			out = append(out, BreakingChange{
				Operation: displayOp(key),
				Kind:      "removed_operation",
				Detail:    "operation removed from candidate contract",
			})
			continue
		}
		out = append(out, diffOperation(key, base, cand)...)
	}
	return out
}

type opView struct {
	security    []string
	responses   map[string]*openapi3.Response
	params      []paramView
	requestReq  bool
	reqProps    map[string]schemaView
	reqRequired map[string]bool
}

type paramView struct {
	locate   string // in:name
	required bool
	schema   schemaView
}

type schemaView struct {
	types []string
	ref   string
}

func indexOperations(doc *openapi3.T) map[string]opView {
	out := make(map[string]opView)
	if doc == nil || doc.Paths == nil {
		return out
	}
	for path, item := range doc.Paths.Map() {
		if item == nil {
			continue
		}
		for method, op := range item.Operations() {
			if op == nil {
				continue
			}
			out[OperationKey(method, path)] = buildOpView(op)
		}
	}
	return out
}

func buildOpView(op *openapi3.Operation) opView {
	view := opView{
		responses:   map[string]*openapi3.Response{},
		reqProps:    map[string]schemaView{},
		reqRequired: map[string]bool{},
	}
	if op.Security != nil {
		for _, req := range *op.Security {
			for name := range req {
				view.security = append(view.security, name)
			}
		}
	}
	sort.Strings(view.security)

	if op.Responses != nil {
		for code, ref := range op.Responses.Map() {
			if ref != nil {
				view.responses[code] = ref.Value
			}
		}
	}

	for _, pref := range op.Parameters {
		if pref == nil || pref.Value == nil {
			continue
		}
		p := pref.Value
		view.params = append(view.params, paramView{
			locate:   p.In + ":" + p.Name,
			required: p.Required,
			schema:   schemaFrom(p.Schema),
		})
	}
	sort.Slice(view.params, func(i, j int) bool {
		return view.params[i].locate < view.params[j].locate
	})

	if op.RequestBody != nil && op.RequestBody.Value != nil {
		view.requestReq = op.RequestBody.Value.Required
		if mt := op.RequestBody.Value.Content.Get("application/json"); mt != nil {
			props, required := objectProps(mt.Schema)
			view.reqProps = props
			view.reqRequired = required
		}
	}
	return view
}

func schemaFrom(ref *openapi3.SchemaRef) schemaView {
	if ref == nil {
		return schemaView{}
	}
	view := schemaView{ref: ref.Ref}
	if ref.Value != nil && ref.Value.Type != nil {
		view.types = append([]string{}, ref.Value.Type.Slice()...)
		sort.Strings(view.types)
	}
	return view
}

func objectProps(ref *openapi3.SchemaRef) (map[string]schemaView, map[string]bool) {
	props := map[string]schemaView{}
	required := map[string]bool{}
	if ref == nil || ref.Value == nil {
		return props, required
	}
	schema := ref.Value
	if schema.AllOf != nil {
		for _, part := range schema.AllOf {
			p, r := objectProps(part)
			for k, v := range p {
				props[k] = v
			}
			for k, v := range r {
				required[k] = v
			}
		}
	}
	for name, pref := range schema.Properties {
		props[name] = schemaFrom(pref)
	}
	for _, name := range schema.Required {
		required[name] = true
	}
	return props, required
}

func diffOperation(key string, base, cand opView) []BreakingChange {
	var out []BreakingChange
	opName := displayOp(key)

	if !sameStringSet(base.security, cand.security) {
		// Removing auth or changing required schemes is breaking.
		if len(base.security) > 0 && (len(cand.security) == 0 || !subsetStrings(base.security, cand.security)) {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "security_changed",
				Detail:    fmt.Sprintf("security %v -> %v", base.security, cand.security),
			})
		}
	}

	for code := range base.responses {
		if _, ok := cand.responses[code]; !ok {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "removed_response",
				Detail:    "response status " + code + " removed",
			})
			continue
		}
		baseSchema := jsonSchema(base.responses[code])
		candSchema := jsonSchema(cand.responses[code])
		if baseSchema.types != nil && candSchema.types != nil && !sameStringSet(baseSchema.types, candSchema.types) {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "response_schema_type_changed",
				Detail:    fmt.Sprintf("status %s schema type %v -> %v", code, baseSchema.types, candSchema.types),
			})
		}
		// Detect property type changes on object response schemas.
		baseProps, _ := objectProps(responseSchemaRef(base.responses[code]))
		candProps, _ := objectProps(responseSchemaRef(cand.responses[code]))
		for name, bprop := range baseProps {
			cprop, ok := candProps[name]
			if !ok {
				out = append(out, BreakingChange{
					Operation: opName,
					Kind:      "response_property_removed",
					Detail:    fmt.Sprintf("status %s property %q removed", code, name),
				})
				continue
			}
			if len(bprop.types) > 0 && len(cprop.types) > 0 && !sameStringSet(bprop.types, cprop.types) {
				out = append(out, BreakingChange{
					Operation: opName,
					Kind:      "response_schema_type_changed",
					Detail:    fmt.Sprintf("status %s property %q type %v -> %v", code, name, bprop.types, cprop.types),
				})
			}
		}
	}

	baseParams := map[string]paramView{}
	for _, p := range base.params {
		baseParams[p.locate] = p
	}
	candParams := map[string]paramView{}
	for _, p := range cand.params {
		candParams[p.locate] = p
	}
	for locate, cp := range candParams {
		bp, ok := baseParams[locate]
		if !ok {
			if cp.required {
				out = append(out, BreakingChange{
					Operation: opName,
					Kind:      "new_required_parameter",
					Detail:    "parameter " + locate + " newly required",
				})
			}
			continue
		}
		if !bp.required && cp.required {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "parameter_became_required",
				Detail:    "parameter " + locate + " became required",
			})
		}
		if len(bp.schema.types) > 0 && len(cp.schema.types) > 0 && !sameStringSet(bp.schema.types, cp.schema.types) {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "parameter_type_changed",
				Detail:    fmt.Sprintf("parameter %s type %v -> %v", locate, bp.schema.types, cp.schema.types),
			})
		}
	}

	for name, required := range cand.reqRequired {
		if !required {
			continue
		}
		if !base.reqRequired[name] {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "new_required_request_field",
				Detail:    "request field " + name + " newly required",
			})
		}
	}
	for name, bprop := range base.reqProps {
		cprop, ok := cand.reqProps[name]
		if !ok {
			continue
		}
		if len(bprop.types) > 0 && len(cprop.types) > 0 && !sameStringSet(bprop.types, cprop.types) {
			out = append(out, BreakingChange{
				Operation: opName,
				Kind:      "request_field_type_changed",
				Detail:    fmt.Sprintf("request field %q type %v -> %v", name, bprop.types, cprop.types),
			})
		}
	}

	return out
}

func jsonSchema(resp *openapi3.Response) schemaView {
	ref := responseSchemaRef(resp)
	return schemaFrom(ref)
}

func responseSchemaRef(resp *openapi3.Response) *openapi3.SchemaRef {
	if resp == nil || resp.Content == nil {
		return nil
	}
	if mt := resp.Content.Get("application/json"); mt != nil {
		return mt.Schema
	}
	return nil
}

func displayOp(key string) string {
	return strings.ReplaceAll(key, "\t", " ")
}

func sameStringSet(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func subsetStrings(need, have []string) bool {
	set := map[string]struct{}{}
	for _, h := range have {
		set[h] = struct{}{}
	}
	for _, n := range need {
		if _, ok := set[n]; !ok {
			return false
		}
	}
	return true
}
