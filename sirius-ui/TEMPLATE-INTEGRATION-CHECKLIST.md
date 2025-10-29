# Template System Integration Checklist

**Sprint**: Template System UX Evolution  
**Date Started**: **\*\***\_\_\_**\*\***  
**Team**: UI Team  
**Status**: 🟡 Pre-Sprint Preparation

---

## 📋 Pre-Sprint Requirements

### Type System Alignment

- [ ] **CRITICAL**: Confirm detection type naming convention with backend team

  - [ ] Decision documented: Use dashes (`file-hash`, `file-content`, `version-cmd`)
  - [ ] UI types updated in `src/types/agentTemplateTypes.ts`
  - [ ] Type mapping understood and documented

- [ ] **CRITICAL**: Verify storage format alignment
  - [ ] Backend confirmed using JSON wrapper format
  - [ ] Test template upload/retrieve cycle works
  - [ ] Verified templates sync to agents correctly

### Dependencies

- [ ] Install required npm packages:

  ```bash
  npm install js-yaml @types/js-yaml
  npm install @monaco-editor/react  # For YAML editor
  npm install lodash @types/lodash  # For debounce
  ```

- [ ] Verify existing dependencies:
  - [ ] `zod` for validation schemas
  - [ ] `@tanstack/react-query` for data fetching
  - [ ] `lucide-react` for icons

### Documentation Review

- [ ] Read [CUSTOM-TEMPLATES-UI-HANDOFF-ANALYSIS.md](../../app-agent/CUSTOM-TEMPLATES-UI-HANDOFF-ANALYSIS.md)
- [ ] Review [README.template-ui-integration.md](../documentation/dev/architecture/README.template-ui-integration.md)
- [ ] Check [QUICKREF.template-types.md](../documentation/dev/QUICKREF.template-types.md)
- [ ] Understand module config requirements for all three types

---

## 🏗️ Phase 1: Component Structure & Types

### Type Definitions (Week 1)

- [ ] Create/update `src/types/templateBuilderTypes.ts`

  - [ ] `TemplateFormState` type
  - [ ] `DetectionStepFormData` union type
  - [ ] `ValidationErrors` type
  - [ ] `TemplateBuilderView` enum

- [ ] Update `src/types/agentTemplateTypes.ts`
  - [ ] Change `StepType` to use dashes
  - [ ] Verify all interfaces match agent types
  - [ ] Add JSDoc comments with examples

### Shared UI Components (Week 1)

- [ ] Create `src/components/scanner/templates/shared/`

  - [ ] `PlatformSelector.tsx` - Checkbox group with OS icons
  - [ ] `SeveritySelector.tsx` - Radio group with color badges
  - [ ] `WeightSlider.tsx` - Confidence weight slider (0.0-1.0)
  - [ ] `CollapsibleSection.tsx` - Reusable collapsible container

- [ ] Test shared components in isolation
  - [ ] Unit tests for each component
  - [ ] Storybook stories (if available)
  - [ ] Accessibility testing

---

## 🎨 Phase 2: Template Library Redesign

### Template Library View (Week 1-2)

- [ ] Create `src/components/scanner/templates/TemplateLibrary.tsx`

  - [ ] Search functionality with debounce
  - [ ] Filter by severity, type, platform
  - [ ] Sort options (name, severity, date)
  - [ ] Grid/List view toggle
  - [ ] Category grouping (Standard vs Custom)

- [ ] Create `src/components/scanner/templates/TemplateCard.tsx`

  - [ ] Gradient border by severity
  - [ ] Platform icons display
  - [ ] Tag chips (first 3 + more)
  - [ ] Quick actions (View, Edit, Run, Delete)
  - [ ] Hover effects

- [ ] Create `src/components/scanner/templates/TemplateFilters.tsx`
  - [ ] Search input
  - [ ] Multi-select filters
  - [ ] Active filter pills
  - [ ] Clear all button

### Testing

- [ ] Unit tests for library components
- [ ] Integration test: Filter and search
- [ ] Playwright test: Navigate library

---

## 🛠️ Phase 3: Template Builder (Full Page)

### Builder Container (Week 2)

- [ ] Create `src/components/scanner/templates/TemplateBuilder.tsx`
  - [ ] Full-height scrollable layout
  - [ ] Two-column design (≥1280px)
  - [ ] Sticky header with actions
  - [ ] Mode toggle: Guided Builder | YAML Editor
  - [ ] State management (useState/useReducer)

### Metadata Section (Week 2)

- [ ] Create `src/components/scanner/templates/builder/MetadataSection.tsx`

  - [ ] Template ID input with validation
  - [ ] Template name input
  - [ ] Description textarea
  - [ ] Severity selector
  - [ ] Author input (defaults to current user)
  - [ ] CVE IDs textarea (one per line)
  - [ ] Tags input with chips
  - [ ] References textarea (URLs)
  - [ ] Version input

- [ ] Implement validation
  - [ ] ID format validation
  - [ ] ID uniqueness check (client-side)
  - [ ] CVE format validation
  - [ ] URL format validation for references

### Detection Configuration (Week 2)

- [ ] Create `src/components/scanner/templates/builder/DetectionSection.tsx`
  - [ ] Detection logic selector (all/any)
  - [ ] Steps list with drag-to-reorder
  - [ ] Add step dropdown menu
  - [ ] Step summary cards
  - [ ] Edit/duplicate/delete actions

### Detection Step Modals (Week 2-3)

- [ ] Create `src/components/scanner/templates/builder/steps/FileHashStepModal.tsx`

  - [ ] File path input
  - [ ] Hash value input
  - [ ] Algorithm selector
  - [ ] Platform selector
  - [ ] Weight slider
  - [ ] Validation

- [ ] Create `src/components/scanner/templates/builder/steps/FileContentStepModal.tsx`

  - [ ] File path input
  - [ ] Pattern textarea (one per line)
  - [ ] Regex tester (collapsible)
  - [ ] Platform selector
  - [ ] Weight slider
  - [ ] Validation

- [ ] Create `src/components/scanner/templates/builder/steps/VersionCmdStepModal.tsx`
  - [ ] Command input (single string)
  - [ ] Version regex input
  - [ ] Vulnerable versions array input
  - [ ] Expected exit code input
  - [ ] Platform selector
  - [ ] Weight slider
  - [ ] Validation

### YAML Features (Week 3)

- [ ] Create `src/components/scanner/templates/builder/YamlImporter.tsx`

  - [ ] File upload
  - [ ] Paste area
  - [ ] YAML validation
  - [ ] Form auto-fill
  - [ ] Error handling

- [ ] Create `src/components/scanner/templates/builder/YamlPreview.tsx`

  - [ ] Monaco editor integration
  - [ ] Real-time generation from form
  - [ ] Syntax highlighting
  - [ ] Copy to clipboard button
  - [ ] Download button
  - [ ] Validation status indicator

- [ ] Implement YAML generation

  - [ ] `generateTemplateYAML` function
  - [ ] Debounced preview updates
  - [ ] Handle empty optional fields
  - [ ] Proper YAML formatting

- [ ] Implement YAML parsing
  - [ ] `parseTemplateYAML` function
  - [ ] Error handling
  - [ ] Form state mapping
  - [ ] Type safety

### Testing

- [ ] Unit tests for YAML functions
- [ ] Unit tests for each step modal
- [ ] Integration test: Complete form flow
- [ ] Playwright test: Create template end-to-end

---

## 👁️ Phase 4: Template Viewer Enhancement

### Viewer Modal (Week 3)

- [ ] Create `src/components/scanner/templates/TemplateViewer.tsx`
  - [ ] Large dialog layout
  - [ ] Tab navigation
  - [ ] Header with template info
  - [ ] Footer with actions

### Viewer Tabs (Week 3)

- [ ] Create `src/components/scanner/templates/viewer/OverviewTab.tsx`

  - [ ] Two-column layout
  - [ ] Template details card
  - [ ] Severity display
  - [ ] Platform icons
  - [ ] Full description
  - [ ] CVE links
  - [ ] Tag chips
  - [ ] Reference links

- [ ] Create `src/components/scanner/templates/viewer/DetectionStepsTab.tsx`

  - [ ] Detection logic indicator
  - [ ] Expandable step cards
  - [ ] Step configuration display
  - [ ] Confidence calculation
  - [ ] Visual flow diagram

- [ ] Create `src/components/scanner/templates/viewer/YamlSourceTab.tsx`
  - [ ] Monaco editor (read-only)
  - [ ] Syntax highlighting
  - [ ] Copy button
  - [ ] Download button
  - [ ] Line numbers

### Testing

- [ ] Unit tests for viewer tabs
- [ ] Integration test: Navigate tabs
- [ ] Playwright test: View template details

---

## 🔌 Phase 5: Integration & State Management

### Main Tab Orchestration (Week 3-4)

- [ ] Update `src/components/scanner/agent/AgentTemplatesTab.tsx`
  - [ ] View state management
  - [ ] Navigation between views
  - [ ] Template state management
  - [ ] Loading states
  - [ ] Error handling

### API Integration (Week 4)

- [ ] Verify tRPC endpoints work

  - [ ] `getTemplates` - List all
  - [ ] `getTemplate` - Get single with YAML
  - [ ] `uploadTemplate` - Create new
  - [ ] `validateTemplate` - Validate before save
  - [ ] `deleteTemplate` - Remove custom

- [ ] Add client-side helpers
  - [ ] Template ID uniqueness check
  - [ ] YAML generation utility
  - [ ] YAML parsing utility
  - [ ] Validation utilities

### Error Handling (Week 4)

- [ ] Implement error boundaries
- [ ] Add user-friendly error messages
- [ ] Toast notifications for actions
- [ ] Validation error display
- [ ] Network error handling

### Testing

- [ ] Integration tests for state management
- [ ] API integration tests
- [ ] Error scenario tests
- [ ] Playwright: Full user flows

---

## 🧪 Phase 6: Testing Strategy

### Unit Tests

- [ ] YAML generation tests

  - [ ] Valid form data → valid YAML
  - [ ] Empty optional fields handled
  - [ ] Special characters escaped
  - [ ] All module types covered

- [ ] YAML parsing tests

  - [ ] Valid YAML → valid form data
  - [ ] Malformed YAML handled
  - [ ] Missing fields handled
  - [ ] Type safety verified

- [ ] Validation tests
  - [ ] Template ID format
  - [ ] CVE format
  - [ ] Config validation per module
  - [ ] Required fields

### Integration Tests

- [ ] Template library

  - [ ] Search functionality
  - [ ] Filter combinations
  - [ ] Sort options
  - [ ] View toggle

- [ ] Template builder

  - [ ] Form submission
  - [ ] YAML preview updates
  - [ ] Step management
  - [ ] Import from YAML

- [ ] Template viewer
  - [ ] Tab navigation
  - [ ] Content display
  - [ ] Action buttons

### End-to-End Tests (Playwright)

- [ ] **Scenario 1**: Create file-hash template

  - [ ] Fill form
  - [ ] Add step
  - [ ] Preview YAML
  - [ ] Submit
  - [ ] Verify in library

- [ ] **Scenario 2**: Create multi-step template

  - [ ] Add multiple steps
  - [ ] Set detection logic
  - [ ] Verify YAML structure
  - [ ] Submit and verify

- [ ] **Scenario 3**: Import and modify template

  - [ ] Import YAML
  - [ ] Verify form populated
  - [ ] Modify fields
  - [ ] Submit update

- [ ] **Scenario 4**: Search and filter
  - [ ] Create test templates
  - [ ] Search by name
  - [ ] Filter by severity
  - [ ] Verify results

---

## 🎨 Phase 7: Design System Compliance

### Color Palette

- [ ] Verify violet theme usage

  - [ ] Primary actions: `bg-violet-600 hover:bg-violet-500`
  - [ ] Borders: `border-violet-500/30`
  - [ ] Text highlights: `text-violet-400`

- [ ] Verify dark mode support

  - [ ] Backgrounds: `bg-gray-800`, `bg-gray-900`
  - [ ] Borders: `border-gray-700`
  - [ ] Cards: `bg-gray-800/50`
  - [ ] Text: `text-gray-300`, `text-gray-400`

- [ ] Severity colors consistent
  - [ ] Critical: `bg-red-500/20 text-red-400`
  - [ ] High: `bg-orange-500/20 text-orange-400`
  - [ ] Medium: `bg-yellow-500/20 text-yellow-400`
  - [ ] Low: `bg-blue-500/20 text-blue-400`
  - [ ] Info: `bg-gray-500/20 text-gray-400`

### Component Standards

- [ ] All components use shadcn/ui
- [ ] Consistent spacing (space-y-4, space-y-2)
- [ ] Consistent border radius (rounded-lg, rounded-md)
- [ ] lucide-react icons throughout
- [ ] Smooth transitions (transition-colors duration-200)

### Responsive Design

- [ ] Mobile breakpoint (sm: 640px) tested
- [ ] Tablet breakpoint (md: 768px) tested
- [ ] Desktop breakpoint (lg: 1024px) tested
- [ ] Large desktop (xl: 1280px) tested
- [ ] Forms stack properly on mobile
- [ ] YAML preview sidebar works on all sizes

---

## ✅ Final Validation

### Code Quality

- [ ] All TypeScript types are correct
- [ ] No `any` types used
- [ ] All functions have JSDoc comments
- [ ] Console errors resolved
- [ ] Linter warnings resolved
- [ ] No unused imports

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

### Performance

- [ ] YAML preview debounced
- [ ] Template list uses pagination/virtualization
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] No memory leaks

### Documentation

- [ ] Code comments added
- [ ] README updated
- [ ] Component documentation
- [ ] Integration notes

### User Experience

- [ ] Create template < 3 minutes
- [ ] No YAML knowledge required
- [ ] All module types work
- [ ] YAML import works
- [ ] Search returns results < 200ms
- [ ] Dark mode consistent
- [ ] Mobile responsive (≥375px)

---

## 🚀 Launch Readiness

### Pre-Launch

- [ ] **Critical issues resolved**

  - [ ] Type naming confirmed
  - [ ] Storage format aligned

- [ ] **All tests passing**

  - [ ] Unit tests: 100% pass
  - [ ] Integration tests: 100% pass
  - [ ] Playwright tests: 100% pass

- [ ] **Backend coordination complete**
  - [ ] Platform aggregation deployed
  - [ ] Enhanced validation deployed
  - [ ] Storage format updated

### Launch Day

- [ ] Monitor for errors
- [ ] Track template creation success rate
- [ ] Collect user feedback
- [ ] Document issues

### Post-Launch

- [ ] Address bug reports
- [ ] Collect enhancement requests
- [ ] Plan Phase 2 features
- [ ] Update documentation

---

## 📊 Success Metrics

Track these metrics to validate success:

| Metric                          | Target  | Actual |
| ------------------------------- | ------- | ------ |
| Template creation time          | < 3 min | \_\_\_ |
| Template creation success rate  | > 95%   | \_\_\_ |
| Template execution success rate | > 90%   | \_\_\_ |
| User satisfaction (1-10)        | > 8     | \_\_\_ |
| Bug reports (first week)        | < 5     | \_\_\_ |
| Console errors                  | 0       | \_\_\_ |
| Accessibility score             | 100     | \_\_\_ |

---

## 📞 Support Contacts

**For Questions**:

- Type naming: Backend Team Lead
- API endpoints: Backend Engineer
- Module configs: Agent Team Lead
- Design system: UI/UX Designer

**For Issues**:

- Critical bugs: Immediately escalate
- Medium bugs: Document and prioritize
- Enhancement requests: Track for Phase 2

---

**Checklist Version**: 1.0  
**Created**: October 25, 2025  
**Team**: UI Development Team  
**Sprint Duration**: 4 weeks  
**Status**: 🟡 Ready for Sprint Kickoff
