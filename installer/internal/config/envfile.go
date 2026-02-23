package config

import (
	"bufio"
	"os"
	"sort"
	"strings"
)

type LineKind string

const (
	KindBlank   LineKind = "blank"
	KindComment LineKind = "comment"
	KindKV      LineKind = "kv"
)

type Line struct {
	Kind  LineKind
	Raw   string
	Key   string
	Value string
}

type EnvFile struct {
	Lines  []Line
	Values map[string]string
}

func ParseEnvFile(path string) (*EnvFile, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	out := &EnvFile{
		Lines:  make([]Line, 0, 64),
		Values: make(map[string]string),
	}

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		raw := scanner.Text()
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			out.Lines = append(out.Lines, Line{Kind: KindBlank, Raw: raw})
			continue
		}
		if strings.HasPrefix(trimmed, "#") {
			out.Lines = append(out.Lines, Line{Kind: KindComment, Raw: raw})
			continue
		}

		k, v, ok := splitEnvKV(raw)
		if !ok {
			// Preserve unknown rows as comments so rendering remains stable.
			out.Lines = append(out.Lines, Line{Kind: KindComment, Raw: raw})
			continue
		}
		out.Values[k] = v
		out.Lines = append(out.Lines, Line{Kind: KindKV, Raw: raw, Key: k, Value: v})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return out, nil
}

func NewEmptyEnvFile() *EnvFile {
	return &EnvFile{
		Lines:  []Line{},
		Values: map[string]string{},
	}
}

func Render(base *EnvFile, values map[string]string) string {
	if base == nil {
		base = NewEmptyEnvFile()
	}

	seen := make(map[string]struct{}, len(values))
	var b strings.Builder

	for _, line := range base.Lines {
		switch line.Kind {
		case KindBlank, KindComment:
			b.WriteString(line.Raw)
		case KindKV:
			v, ok := values[line.Key]
			if !ok {
				v = line.Value
			}
			b.WriteString(line.Key + "=" + v)
			seen[line.Key] = struct{}{}
		}
		b.WriteString("\n")
	}

	extra := make([]string, 0, len(values))
	for k := range values {
		if _, ok := seen[k]; !ok {
			extra = append(extra, k)
		}
	}
	sort.Strings(extra)
	if len(extra) > 0 {
		b.WriteString("\n# Added by Sirius installer\n")
		for _, k := range extra {
			b.WriteString(k + "=" + values[k] + "\n")
		}
	}

	return b.String()
}

func splitEnvKV(raw string) (string, string, bool) {
	idx := strings.IndexRune(raw, '=')
	if idx <= 0 {
		return "", "", false
	}
	key := strings.TrimSpace(raw[:idx])
	if key == "" {
		return "", "", false
	}
	val := strings.TrimSpace(raw[idx+1:])
	return key, val, true
}
