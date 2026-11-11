package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/SiriusScan/go-api/sirius/store/templates"
	"regexp"
	"sort"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// Script represents an NSE script
type Script struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Path     string         `json:"path"`
	Protocol string         `json:"protocol"`
	Content  *ScriptContent `json:"content,omitempty"`
}

// ScriptContent represents script content and metadata
type ScriptContent struct {
	Content   string         `json:"content"`
	Metadata  ScriptMetadata `json:"metadata"`
	UpdatedAt int64          `json:"updated_at"`
}

// ScriptMetadata represents script metadata
type ScriptMetadata struct {
	Author      string   `json:"author"`
	Tags        []string `json:"tags"`
	Description string   `json:"description"`
}

// Manifest represents the NSE scripts manifest
type Manifest struct {
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Scripts     map[string]Script `json:"scripts"`
}

const (
	nseManifestKey  = "nse:manifest"
	nseScriptPrefix = "nse:script:"
)

// Injectable for isolated HTTP tests; mutations require atomic store support.
var newScriptStore = store.NewValkeyStore

var scriptIDPattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9_.-]*$`)

func scriptID(value string) (string, error) {
	id := templates.CanonicalScriptID(value)
	if !scriptIDPattern.MatchString(id) || templates.CanonicalScriptID(id) != id {
		return "", fiber.NewError(400, "Invalid script ID")
	}
	return id, nil
}

func scriptError(c *fiber.Ctx, err error) error {
	code := 500
	var e *fiber.Error
	if errors.As(err, &e) {
		code = e.Code
	}
	message := "Failed to access script store"
	if code != 500 {
		message = err.Error()
	}
	return c.Status(code).JSON(fiber.Map{"error": message})
}

func GetScripts(c *fiber.Ctx) error {
	kv, err := newScriptStore()
	if err != nil {
		return scriptError(c, err)
	}
	defer kv.Close()
	m, err := readScriptManifest(c.UserContext(), kv)
	if err != nil {
		return scriptError(c, err)
	}
	result := make([]Script, 0, len(m.keys))
	ids := make([]string, 0, len(m.keys))
	for id := range m.keys {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		if m.deleted[id] {
			continue
		}
		entry, err := m.script(id)
		if err != nil {
			return scriptError(c, err)
		}
		result = append(result, entry)
	}
	return c.JSON(result)
}

func GetScript(c *fiber.Ctx) error {
	id, err := scriptID(c.Params("id"))
	if err != nil {
		return scriptError(c, err)
	}
	kv, err := newScriptStore()
	if err != nil {
		return scriptError(c, err)
	}
	defer kv.Close()
	m, err := readScriptManifest(c.UserContext(), kv)
	if err != nil {
		return scriptError(c, err)
	}
	entry, err := m.script(id)
	if err != nil {
		return scriptError(c, err)
	}
	_, content, err := scriptContentSnapshot(c.UserContext(), kv, id, m.keys[id])
	if err != nil {
		return scriptError(c, err)
	}
	if content != nil {
		if err := json.Unmarshal([]byte(*content), &entry.Content); err != nil {
			return scriptError(c, err)
		}
	}
	return c.JSON(entry)
}

func CreateScript(c *fiber.Ctx) error {
	var entry Script
	if err := c.BodyParser(&entry); err != nil {
		return scriptError(c, fiber.NewError(400, "Invalid request body"))
	}
	id, err := scriptID(entry.ID)
	if err != nil {
		return scriptError(c, err)
	}
	entry.ID = id
	if entry.Name == "" || entry.Content == nil || entry.Content.Content == "" {
		return scriptError(c, fiber.NewError(400, "Script name and content are required"))
	}
	if entry.Protocol == "" {
		entry.Protocol = "custom"
	}
	if entry.Path == "" {
		entry.Path = fmt.Sprintf("scripts/%s.nse", id)
	}
	entry.Content.UpdatedAt = time.Now().Unix()
	kv, err := newScriptStore()
	if err != nil {
		return scriptError(c, err)
	}
	defer kv.Close()
	if err := mutateScript(c.UserContext(), kv, "create", id, &entry, entry.Content); err != nil {
		return scriptError(c, err)
	}
	return c.Status(201).JSON(entry)
}

func UpdateScript(c *fiber.Ctx) error {
	id, err := scriptID(c.Params("id"))
	if err != nil {
		return scriptError(c, err)
	}
	var content ScriptContent
	if err := c.BodyParser(&content); err != nil || content.Content == "" {
		return scriptError(c, fiber.NewError(400, "Script content is required"))
	}
	content.UpdatedAt = time.Now().Unix()
	kv, err := newScriptStore()
	if err != nil {
		return scriptError(c, err)
	}
	defer kv.Close()
	if err := mutateScript(c.UserContext(), kv, "update", id, nil, &content); err != nil {
		return scriptError(c, err)
	}
	return c.JSON(fiber.Map{"message": "Script updated successfully", "script_id": id})
}

func DeleteScript(c *fiber.Ctx) error {
	id, err := scriptID(c.Params("id"))
	if err != nil {
		return scriptError(c, err)
	}
	kv, err := newScriptStore()
	if err != nil {
		return scriptError(c, err)
	}
	defer kv.Close()
	if err := mutateScript(c.UserContext(), kv, "delete", id, nil, nil); err != nil {
		return scriptError(c, err)
	}
	return c.SendStatus(204)
}

// Raw objects preserve future scanner metadata across REST mutations.
type scriptManifest struct {
	raw     *string
	root    map[string]json.RawMessage
	entries map[string]json.RawMessage
	keys    map[string]string
	deleted map[string]bool
}

func scriptValue(ctx context.Context, kv store.KVStore, key string) (*string, error) {
	response, err := kv.GetValue(ctx, key)
	if errors.Is(err, store.ErrKeyNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &response.Message.Value, nil
}

func readScriptManifest(ctx context.Context, kv store.KVStore) (*scriptManifest, error) {
	raw, err := scriptValue(ctx, kv, nseManifestKey)
	if err != nil {
		return nil, err
	}
	m := &scriptManifest{raw: raw, root: map[string]json.RawMessage{}, entries: map[string]json.RawMessage{}, keys: map[string]string{}, deleted: map[string]bool{}}
	if raw == nil {
		return m, nil
	}
	if err = json.Unmarshal([]byte(*raw), &m.root); err != nil || m.root == nil {
		return nil, fmt.Errorf("invalid manifest object")
	}
	if v, ok := m.root["scripts"]; ok {
		if err = json.Unmarshal(v, &m.entries); err != nil || m.entries == nil {
			return nil, fmt.Errorf("invalid scripts object")
		}
	}
	if v, ok := m.root["deletedScripts"]; ok {
		if err = json.Unmarshal(v, &m.deleted); err != nil || m.deleted == nil {
			return nil, fmt.Errorf("invalid tombstones")
		}
	}
	for id, deleted := range m.deleted {
		if !deleted || !scriptIDPattern.MatchString(id) || templates.CanonicalScriptID(id) != id {
			return nil, fmt.Errorf("invalid script tombstone")
		}
	}
	for key, v := range m.entries {
		id := templates.CanonicalScriptID(key)
		if !scriptIDPattern.MatchString(id) || templates.CanonicalScriptID(id) != id {
			return nil, fmt.Errorf("invalid manifest script ID")
		}
		if _, exists := m.keys[id]; exists {
			return nil, fiber.NewError(409, "Ambiguous script aliases")
		}
		var entry map[string]json.RawMessage
		if err = json.Unmarshal(v, &entry); err != nil || entry == nil {
			return nil, fmt.Errorf("invalid script entry")
		}
		if m.deleted[id] {
			return nil, fmt.Errorf("script is both present and deleted")
		}
		m.keys[id] = key
	}
	return m, nil
}

func (m *scriptManifest) script(id string) (Script, error) {
	var entry Script
	key, ok := m.keys[id]
	if !ok || m.deleted[id] {
		return entry, fiber.NewError(404, "Script not found")
	}
	if err := json.Unmarshal(m.entries[key], &entry); err != nil {
		return entry, err
	}
	entry.ID = id
	return entry, nil
}

// Compare both canonical and legacy slots so migration cannot overwrite a concurrent edit.
func scriptContentSnapshot(ctx context.Context, kv store.KVStore, id, legacy string) (map[string]*string, *string, error) {
	expected := map[string]*string{}
	keys := []string{id}
	if legacy != "" && legacy != id {
		keys = append(keys, legacy)
	}
	var content *string
	for _, key := range keys {
		value, err := scriptValue(ctx, kv, nseScriptPrefix+key)
		if err != nil {
			return nil, nil, err
		}
		expected[nseScriptPrefix+key] = value
		if value != nil {
			if content != nil {
				return nil, nil, fiber.NewError(409, "Ambiguous script content aliases")
			}
			content = value
		}
	}
	return expected, content, nil
}

func mutateScript(ctx context.Context, kv store.KVStore, operation, id string, entry *Script, content *ScriptContent) error {
	// Keep the shared content envelope readable by strict JSON consumers.
	if content != nil && content.Metadata.Tags == nil {
		content.Metadata.Tags = []string{}
	}
	atomic, ok := kv.(store.AtomicValueUpdater)
	if !ok {
		return fmt.Errorf("atomic script mutations unsupported")
	}
	for attempt := 0; attempt < 8; attempt++ {
		m, err := readScriptManifest(ctx, kv)
		if err != nil {
			return err
		}
		old, exists := m.keys[id]
		if operation == "create" {
			if exists && !m.deleted[id] {
				return fiber.NewError(409, "Script already exists")
			}
		} else {
			if _, err := m.script(id); err != nil {
				return err
			}
		}
		expected, previousContent, err := scriptContentSnapshot(ctx, kv, id, old)
		if err != nil {
			return err
		}
		expected[nseManifestKey] = m.raw
		updates := map[string]*string{}
		if operation == "delete" {
			var fields struct {
				Protocol string
				Source   *struct{ Type string }
			}
			if err := json.Unmarshal(m.entries[old], &fields); err != nil {
				return err
			}
			custom := fields.Protocol == "custom"
			if fields.Source != nil {
				custom = fields.Source.Type == "custom"
			}
			if !custom {
				return fiber.NewError(403, "Cannot delete system script")
			}
			delete(m.entries, old)
			m.deleted[id] = true
			for key := range expected {
				if key != nseManifestKey {
					updates[key] = nil
				}
			}
		} else {
			if operation == "create" {
				// Do not silently replace orphaned content left by legacy partial writes.
				for key, value := range expected {
					if key != nseManifestKey && value != nil && !m.deleted[id] {
						return fiber.NewError(409, "Script content already exists")
					}
				}
				fields := map[string]interface{}{"id": id, "name": entry.Name, "path": entry.Path, "protocol": entry.Protocol, "source": map[string]string{"type": "custom"}}
				data, err := json.Marshal(fields)
				if err != nil {
					return err
				}
				delete(m.entries, old)
				m.entries[id] = data
				delete(m.deleted, id)
			} else if old != id {
				m.entries[id] = m.entries[old]
				delete(m.entries, old)
			}
			var data []byte
			var err error
			if operation == "update" {
				data, err = mergeScriptContent(previousContent, content)
			} else {
				data, err = json.Marshal(content)
			}
			if err != nil {
				return err
			}
			value := string(data)
			updates[nseScriptPrefix+id] = &value
			if old != "" && old != id {
				updates[nseScriptPrefix+old] = nil
			}
		}
		data, err := json.Marshal(m.entries)
		if err != nil {
			return err
		}
		m.root["scripts"] = data
		data, err = json.Marshal(m.deleted)
		if err != nil {
			return err
		}
		m.root["deletedScripts"] = data
		data, err = json.Marshal(m.root)
		if err != nil {
			return err
		}
		value := string(data)
		updates[nseManifestKey] = &value
		applied, err := atomic.CompareAndSwapValues(ctx, expected, updates)
		if err != nil {
			return err
		}
		if applied {
			return nil
		}
	}
	return fiber.NewError(409, "Script changed concurrently; retry the request")
}

// mergeScriptContent replaces the REST-owned fields while preserving extensions.
// REST updated_at and an existing scanner updatedAt are both Unix seconds.
func mergeScriptContent(previous *string, content *ScriptContent) ([]byte, error) {
	root := map[string]json.RawMessage{}
	metadata := map[string]json.RawMessage{}
	if previous != nil {
		if err := json.Unmarshal([]byte(*previous), &root); err != nil || root == nil {
			return nil, fmt.Errorf("invalid script content object")
		}
		rawContent, present := root["content"]
		var previousText *string
		if !present || json.Unmarshal(rawContent, &previousText) != nil || previousText == nil {
			return nil, fmt.Errorf("invalid or missing script content string")
		}
		// Validate known REST fields, rather than silently repairing corrupt data.
		var known ScriptContent
		if err := json.Unmarshal([]byte(*previous), &known); err != nil {
			return nil, fmt.Errorf("invalid script content: %w", err)
		}
		if raw, ok := root["metadata"]; ok {
			if err := json.Unmarshal(raw, &metadata); err != nil || metadata == nil {
				return nil, fmt.Errorf("invalid script metadata object")
			}
		}
		if raw, ok := root["updatedAt"]; ok {
			var timestamp int64
			if string(raw) == "null" {
				return nil, fmt.Errorf("invalid scanner timestamp")
			}
			if err := json.Unmarshal(raw, &timestamp); err != nil {
				return nil, fmt.Errorf("invalid scanner timestamp: %w", err)
			}
			root["updatedAt"], _ = json.Marshal(content.UpdatedAt)
		}
	}
	root["content"], _ = json.Marshal(content.Content)
	root["updated_at"], _ = json.Marshal(content.UpdatedAt)
	metadata["author"], _ = json.Marshal(content.Metadata.Author)
	metadata["tags"], _ = json.Marshal(content.Metadata.Tags)
	metadata["description"], _ = json.Marshal(content.Metadata.Description)
	root["metadata"], _ = json.Marshal(metadata)
	return json.Marshal(root)
}
