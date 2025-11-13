---
title: "Sirius UI Style Guide"
description: "Comprehensive design system documentation for Sirius 0.4.0 UI, including colors, typography, spacing, components, and design patterns. This guide serves as the authoritative reference for all teams working on Sirius-related projects."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Sirius Development Team"
tags: ["ui", "design-system", "style-guide", "components", "tailwind", "shadcn"]
categories: ["development", "ui-design"]
difficulty: "intermediate"
prerequisites: ["tailwindcss", "react", "typescript"]
related_docs:
  - "README.development.md"
  - "ABOUT.documentation.md"
dependencies:
  - "sirius-ui/tailwind.config.ts"
  - "sirius-ui/src/styles/globals.css"
  - "sirius-ui/src/pages/dashboard.tsx"
  - "sirius-ui/src/pages/scanner.tsx"
llm_context: "high"
search_keywords:
  [
    "sirius ui style guide",
    "design system",
    "violet theme",
    "dark mode",
    "shadcn components",
    "tailwind config",
    "component patterns",
    "design tokens",
  ]
---

# Sirius UI Style Guide

## Purpose

This document defines the comprehensive design system for Sirius UI version 0.4.0. It serves as the authoritative reference for developers, designers, and teams working on Sirius-related projects. The style guide documents colors, typography, spacing, components, animations, and design patterns used throughout the Sirius UI.

This guide focuses exclusively on the 0.4.0 design system, using the dashboard and scanner pages as exemplars of the current style. It provides clear guidance on how to implement consistent UI components and patterns that match the Sirius brand identity.

## When to Use

- **Before starting new UI development** - Understand the design system first
- **When creating new components** - Ensure consistency with existing patterns
- **When styling new pages** - Reference color, typography, and spacing guidelines
- **When contributing to Sirius projects** - Follow established design patterns
- **During code reviews** - Verify UI implementations match style guide
- **When building component libraries** - Use documented design tokens and patterns
- **For design decisions** - Reference established patterns before creating new ones

## How to Use

1. **Start with the Design System Overview** - Understand the 0.4.0 philosophy
2. **Reference Color System** - Use documented colors for consistency
3. **Follow Typography Guidelines** - Use established text styles
4. **Apply Spacing Patterns** - Use documented spacing scale
5. **Use Component Patterns** - Reference ShadCN components and custom patterns
6. **Apply Design Tokens** - Use documented values for borders, shadows, etc.
7. **Reference Examples** - See dashboard.tsx and scanner.tsx for implementation examples

### Quick Reference

```bash
# Key files for style reference
sirius-ui/tailwind.config.ts          # Color system and animations
sirius-ui/src/styles/globals.css      # CSS variables and custom classes
sirius-ui/src/pages/dashboard.tsx     # Primary exemplar page
sirius-ui/src/pages/scanner.tsx       # Secondary exemplar page
```

## What It Is

### Design System Overview

The Sirius 0.4.0 UI design system is built on a **dark mode first** philosophy with a distinctive **violet theme**. The design emphasizes:

- **Glassmorphism effects** - Subtle backdrop blur and transparency
- **Violet accent colors** - Primary brand color throughout the interface
- **High contrast** - Clear visual hierarchy and readability
- **Consistent spacing** - Predictable layout patterns
- **Smooth animations** - Subtle transitions and loading states

The system uses **ShadCN UI** as the component foundation, customized with Sirius-specific styling. All components are built with **Tailwind CSS** using a carefully defined color palette and design tokens.

### Color System

#### Primary Color Palette

The Sirius UI uses a violet-based color scheme as the primary brand identity:

**Light Mode Colors** (from `tailwind.config.ts`):

- `primary`: `#7C3AED` (violet-600)
- `secondary`: `#D8B4FE` (violet-300)
- `background`: `#e5e7eb` (gray-200)
- `paper`: `#F9FAFB` (gray-50)
- `header`: `#8b5cf6` (violet-500)
- `accent`: `#A855F7` (violet-500)
- `text`: `#111827` (gray-900)

**Dark Mode Colors** (primary focus):

- `dark-primary`: `#4338CA` (indigo-700)
- `dark-secondary`: `#6D28D9` (violet-700)
- `dark-header`: `#282843` (custom dark violet)
- `dark-paper`: `#6D28D9` (violet-700)
- `dark-background`: `#1c1e30` (custom dark blue-gray)
- `dark-background-to`: `#2f3050` (custom dark blue-gray gradient end)
- `dark-accent`: `#5B21B6` (violet-800)

#### CSS Variables (from `globals.css`)

The system uses CSS variables for theming, mapped to Tailwind config:

**Light Mode Variables**:

- `--background`: `220, 13%, 100%, 1` (white)
- `--foreground`: `222.2 84% 4.9%` (dark gray)
- `--primary`: `222.2 47.4% 11.2%` (dark blue-gray)
- `--secondary`: `238, 34%, 30%, 1` (dark violet)
- `--muted`: `210 40% 96.1%` (light gray)
- `--accent`: `210 40% 96.1%` (light gray)
- `--destructive`: `0 84.2% 60.2%` (red)
- `--border`: `214.3 31.8% 91.4%` (light gray)
- `--radius`: `0.5rem`

**Dark Mode Variables**:

- `--background`: `234, 26%, 15%, 1` (dark blue-gray)
- `--foreground`: `210 40% 98%` (near white)
- `--primary`: `210 40% 98%` (near white)
- `--secondary`: `238, 34%, 30%, 1` (dark violet)
- `--muted`: `217.2 32.6% 17.5%` (dark gray)
- `--accent`: `217.2 32.6% 17.5%` (dark gray)
- `--destructive`: `0 62.8% 30.6%` (dark red)
- `--border`: `217.2 32.6% 17.5%` (dark gray)

#### Semantic Colors

**Success States**:

- Background: `bg-green-950/20` with `border-green-500/30`
- Text: `text-green-400`, `text-green-300`
- Used for: Positive metrics, successful operations

**Error/Critical States**:

- Background: `bg-red-500/10` or `bg-red-950/20` with `border-red-500/30`
- Text: `text-red-400`, `text-red-300`
- Used for: Critical alerts, errors, destructive actions

**Warning States**:

- Background: `bg-yellow-500/20` with `border-yellow-500/30`
- Text: `text-yellow-400`
- Used for: Warnings, cautionary information

**Info States**:

- Background: `bg-blue-500/20` with `border-blue-500/30`
- Text: `text-blue-400`
- Used for: Informational messages

#### Severity Colors

Used for vulnerability severity indicators:

- **Critical**: `bg-red-700`, `text-red-400` (or `bg-red-500/20 text-red-400`)
- **High**: `bg-orange-700`, `text-orange-400` (or `bg-orange-500/20 text-orange-400`)
- **Medium**: `bg-yellow-700`, `text-yellow-400` (or `bg-yellow-500/20 text-yellow-400`)
- **Low**: `bg-green-700`, `text-green-400` (or `bg-green-500/20 text-green-400`)
- **Informational**: `bg-blue-700`, `text-blue-400` (or `bg-blue-500/20 text-blue-400`)

#### Opacity and Transparency Patterns

The design system extensively uses opacity for layering and depth:

- **Borders**: `border-violet-500/20` (20% opacity) - Standard borders
- **Borders (hover)**: `border-violet-500/40` (40% opacity) - Hover states
- **Borders (primary)**: `border-violet-500/30` (30% opacity) - Important sections
- **Backgrounds**: `bg-gray-900/50` (50% opacity) - Card backgrounds
- **Backgrounds (subtle)**: `bg-violet-500/10` (10% opacity) - Accent backgrounds
- **Backgrounds (hover)**: `bg-violet-500/20` (20% opacity) - Interactive hover states
- **Shadows**: `shadow-violet-500/5` (5% opacity) - Subtle glow effects

### Typography

#### Font Families

The Sirius UI uses system font stacks for optimal performance:

- **Primary**: System default (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- **Monospace**: System monospace for code (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)

#### Type Scale

Text sizes follow Tailwind's default scale:

- **xs**: `0.75rem` (12px) - Small labels, captions
- **sm**: `0.875rem` (14px) - Body text, form labels, secondary information
- **base**: `1rem` (16px) - Default body text
- **lg**: `1.125rem` (18px) - Section headings, emphasized text
- **xl**: `1.25rem` (20px) - Large headings
- **2xl**: `1.5rem` (24px) - Page section titles
- **3xl**: `1.875rem` (30px) - Page main titles
- **4xl**: `2.25rem` (36px) - Hero headings
- **5xl**: `3rem` (48px) - Large hero values (e.g., dashboard metrics)

#### Font Weights

- **thin**: `100` - Not commonly used
- **extralight**: `200` - Not commonly used
- **light**: `300` - Not commonly used
- **normal**: `400` - Default body text
- **medium**: `500` - Emphasized text, labels
- **semibold**: `600` - Section headings, important labels
- **bold**: `700` - Main headings, critical information
- **extrabold**: `800` - Not commonly used
- **black**: `900` - Not commonly used

#### Text Colors

**Foreground Colors**:

- `text-white` - Primary text on dark backgrounds
- `text-foreground` - Semantic foreground (adapts to theme)
- `text-gray-400` - Secondary/muted text
- `text-gray-300` - Tertiary text
- `text-muted-foreground` - Semantic muted text

**Accent Text Colors**:

- `text-violet-400` - Primary accent text
- `text-violet-300` - Secondary accent text
- `text-violet-300/70` - Muted accent text (70% opacity)

**Semantic Text Colors**:

- `text-red-400` - Error/critical text
- `text-green-400` - Success text
- `text-yellow-400` - Warning text
- `text-blue-400` - Info text

#### Heading Hierarchy

**H1** (Page Titles):

- Size: `text-3xl` (30px)
- Weight: `font-bold`
- Color: `text-white`
- Usage: Main page titles (e.g., "Security Dashboard")

**H2** (Section Headings):

- Size: `text-lg` (18px)
- Weight: `font-semibold`
- Color: `text-violet-300`
- Usage: Section titles, card headers

**H3** (Subsection Headings):

- Size: `text-base` (16px) or `text-sm` (14px)
- Weight: `font-medium` or `font-semibold`
- Color: `text-violet-300` or `text-white`
- Usage: Subsection titles, card subheadings

### Spacing & Layout

#### Spacing Scale

Sirius UI uses Tailwind's default spacing scale (4px base unit):

- **xs**: `0.5rem` (8px) - Tight spacing
- **sm**: `1rem` (16px) - Small gaps
- **md**: `1.5rem` (24px) - Medium gaps
- **lg**: `2rem` (32px) - Large gaps
- **xl**: `3rem` (48px) - Extra large gaps

Common spacing values:

- `gap-2` (8px) - Tight component spacing
- `gap-3` (12px) - Standard component spacing
- `gap-4` (16px) - Card internal spacing
- `gap-6` (24px) - Section spacing, grid gaps
- `gap-8` (32px) - Large section spacing

#### Padding Patterns

**Card Padding**:

- Standard: `p-6` (24px) - Card content padding
- Compact: `p-4` (16px) - Smaller cards
- Responsive: `p-4 md:p-6` - Adaptive padding

**Section Padding**:

- Standard: `px-4 py-6` or `px-6 py-8` - Page sections
- Responsive: `px-4 md:px-6` - Adaptive horizontal padding

**Component Padding**:

- Buttons: `px-4 py-2` (default), `px-3` (sm), `px-8` (lg)
- Inputs: `px-3 py-2` - Form inputs
- Badges: `px-2.5 py-0.5` - Small badges

#### Margin Patterns

**Section Margins**:

- `space-y-8` - Vertical spacing between major sections
- `space-y-6` - Vertical spacing between cards
- `space-y-4` - Vertical spacing between related items
- `space-y-2` - Tight vertical spacing

**Component Margins**:

- `mb-4` - Standard bottom margin
- `mb-2` - Small bottom margin
- `mt-4` - Standard top margin

#### Grid System

**Common Grid Patterns**:

- `grid-cols-1 md:grid-cols-2` - Two column responsive grid
- `grid-cols-1 md:grid-cols-3` - Three column responsive grid
- `lg:grid-cols-3` - Three column on large screens
- `lg:col-span-2` - Span two columns in three-column grid

**Grid Gaps**:

- `gap-6` - Standard grid gap (24px)
- `gap-4` - Tighter grid gap (16px)
- `gap-8` - Larger grid gap (32px)

#### Container Patterns

**Page Container**:

- `container mx-auto` - Centered container with max-width
- `px-4 md:px-6` - Responsive horizontal padding

**Section Container**:

- `-mx-4 md:-mx-6` - Negative margins for full-width sections
- `px-4 md:px-6` - Compensating padding

#### Responsive Breakpoints

Tailwind's default breakpoints:

- **sm**: `640px` - Small tablets
- **md**: `768px` - Tablets
- **lg**: `1024px` - Desktops
- **xl**: `1280px` - Large desktops
- **2xl**: `1400px` - Extra large desktops

**Common Responsive Patterns**:

- `hidden md:flex` - Hide on mobile, show on tablet+
- `flex-col md:flex-row` - Stack on mobile, row on tablet+
- `text-sm md:text-base` - Smaller text on mobile
- `p-4 md:p-6` - Less padding on mobile

### Components

#### ShadCN UI Components

Sirius UI uses ShadCN UI components as the foundation, customized with Sirius-specific styling.

**Button** (`~/components/lib/ui/button`):

- **What it is**: A versatile button component with multiple variants and sizes
- **What it does**: Provides consistent button styling and behavior across the UI
- **Variants**:
  - `default`: Primary action button (`bg-primary text-white`)
  - `destructive`: Destructive actions (`bg-destructive`)
  - `outline`: Secondary actions (`border border-input`)
  - `secondary`: Secondary actions (`bg-secondary`)
  - `ghost`: Tertiary actions (`hover:bg-accent`)
  - `link`: Link-style button (`text-primary underline`)
- **Sizes**: `none`, `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (h-10 w-10)
- **Sirius styling**: Uses violet theme colors, rounded-md borders

**Card** (`~/components/lib/ui/card`):

- **What it is**: A container component for grouping related content
- **What it does**: Provides consistent card styling with header, content, and footer sections
- **Components**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Sirius styling**: Uses `bg-card` with `border` and `rounded-lg`, often with `backdrop-blur-sm` and opacity

**Select** (`~/components/lib/ui/select`):

- **What it is**: A dropdown select component built on Radix UI
- **What it does**: Provides accessible select dropdown functionality
- **Components**: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- **Sirius styling**: Customized with `border-violet-500/20` and `bg-gray-800/50 backdrop-blur-sm`

**Dialog** (`~/components/lib/ui/dialog`):

- **What it is**: A modal dialog component for overlays and confirmations
- **What it does**: Provides accessible modal dialogs with overlay and animations
- **Components**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- **Sirius styling**: Uses `bg-background` with border and shadow, animated transitions

**Table** (`~/components/lib/ui/table`):

- **What it is**: A data table component for displaying structured data
- **What it does**: Provides consistent table styling with header, body, and footer sections
- **Components**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption`
- **Sirius styling**: Uses semantic colors, hover states with `hover:bg-muted/50`

**Badge** (`~/components/lib/ui/badge`):

- **What it is**: A small label component for status indicators
- **What it does**: Displays status, severity, or category information
- **Variants**: `default`, `secondary`, `destructive`, `outline`
- **Sirius styling**: Rounded-full, uses semantic colors, often customized for severity

**Input** (`~/components/lib/ui/input`):

- **What it is**: A text input component for forms
- **What it does**: Provides consistent input styling with focus states
- **Sirius styling**: Uses `border-input`, `bg-background`, focus ring with `ring-ring`

**Tabs** (`~/components/lib/ui/tabs`):

- **What it is**: A tabbed interface component for organizing content
- **What it does**: Provides tab navigation with active states
- **Components**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Sirius styling**: Uses `bg-muted` for tab list, active state with `bg-background`

**Tooltip** (`~/components/lib/ui/tooltip`):

- **What it is**: A hover tooltip component for additional information
- **What it does**: Displays contextual information on hover
- **Components**: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- **Sirius styling**: Uses `bg-popover` with border and shadow, animated appearance

**Popover** (`~/components/lib/ui/popover`):

- **What it is**: A popover component for contextual overlays
- **What it does**: Displays additional content in a floating panel
- **Components**: `Popover`, `PopoverTrigger`, `PopoverContent`
- **Sirius styling**: Uses `bg-popover` with border and shadow, animated transitions

**Skeleton** (`~/components/lib/ui/skeleton`):

- **What it is**: A loading placeholder component
- **What it does**: Shows animated placeholders while content loads
- **Sirius styling**: Uses `bg-muted` with `animate-pulse`, `rounded-md`

#### Custom Component Patterns

**DashboardCard** (`~/components/dashboard/DashboardCard`):

- **What it is**: A specialized card component for dashboard widgets
- **What it does**: Provides consistent dashboard card styling with header, actions, loading, and error states
- **Features**: Icon support, refresh/settings/expand actions, loading skeletons, error states
- **Styling**: Uses Card component with custom header layout, action buttons

**DashboardHeroCard** (`~/components/dashboard/DashboardHeroCard`):

- **What it is**: A prominent metric display card for key dashboard statistics
- **What it does**: Displays large numbers with labels, icons, trends, and CTAs
- **Variants**: `default`, `critical`, `success` - Different color schemes
- **Styling**: Large text (text-5xl), violet/green/red themes, hover glow effects, backdrop blur

**Scanner Sections** (Custom CSS classes):

- **`.scanner-section`**: Base scanner section with subtle borders and backdrop blur
  - `border border-violet-500/20 rounded-lg bg-gray-900/20 backdrop-blur-sm`
  - Subtle shadow with violet accent
- **`.scanner-section-primary`**: Primary interactive scanner section
  - `border border-violet-500/30 rounded-lg bg-violet-500/[0.03] backdrop-blur-sm`
  - Enhanced shadow with stronger violet accent
- **`.scanner-section-hover`**: Hover state for interactive sections
  - Enhanced border and shadow on hover
- **`.scanner-section-padding`**: Standard padding (`p-4 md:p-6`)
- **`.scanner-divider`**: Section divider (`border-t border-violet-500/10 my-6`)

**Section Headers with Icons**:

- Pattern: Icon + heading text
- Icon: `h-5 w-5 text-violet-400` or `h-4 w-4 text-violet-400`
- Heading: `text-lg font-semibold text-violet-300`
- Layout: `flex items-center gap-2`

**Action Buttons and CTAs**:

- Primary CTA: Violet theme with hover effects
- Secondary: Ghost variant or outline
- Links: `text-violet-400 hover:text-violet-300` with arrow indicator

### Design Patterns

#### Card Patterns

**Glassmorphism Cards**:

- Background: `bg-gray-900/50` or `bg-gray-800/50` (semi-transparent)
- Border: `border border-violet-500/20`
- Effect: `backdrop-blur-sm`
- Shadow: `shadow-lg shadow-black/20`
- Usage: Primary content cards, dashboard widgets

**Primary Cards**:

- Background: `bg-violet-500/[0.03]` (very subtle violet tint)
- Border: `border-violet-500/30` (stronger border)
- Shadow: Enhanced shadow with violet accent
- Usage: Important interactive areas, hero cards

**Alert Cards**:

- Success: `bg-green-950/20 border-green-500/30`
- Error: `bg-red-500/10 border-red-500/30` or `bg-red-950/20 border-red-500/30`
- Warning: `bg-yellow-500/20 border-yellow-500/30`
- Usage: Status messages, critical alerts

#### Section Patterns

**Standard Section**:

- Container: `rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm`
- Spacing: `space-y-8` between sections
- Usage: Content sections, data displays

**Sticky Header Section**:

- Container: `sticky top-0 z-30 border-b border-violet-500/20 bg-gray-900/95 backdrop-blur-sm`
- Shadow: `shadow-lg shadow-black/20`
- Usage: Page headers, navigation bars

**Collapsible Section**:

- Toggle: Button with chevron icon, `hover:border-violet-500/40`
- Content: Animated reveal with `animate-in fade-in-50`
- Usage: Expandable content, system health monitoring

#### Header Patterns

**Page Header** (Glassmorphism):

- Background: `bg-gray-900/95` (near opaque with blur)
- Border: `border-b border-violet-500/20`
- Effect: `backdrop-blur-sm`
- Shadow: `shadow-lg shadow-black/20`
- Sticky: `sticky top-0 z-30`
- Padding: `px-4 pb-4 pt-6 md:px-6`

**Section Header**:

- Layout: `flex items-center gap-2` or `flex items-center justify-between`
- Icon: `h-5 w-5 text-violet-400`
- Title: `text-lg font-semibold text-violet-300`
- Actions: Right-aligned button group

#### Button Patterns

**Primary Button**:

- Variant: `default` or custom violet styling
- Colors: `bg-violet-500/10 hover:bg-violet-500/20`
- Border: `border-violet-500/20`
- Text: `text-violet-400 hover:text-violet-300`

**Ghost Button** (Icon buttons):

- Variant: `ghost`
- Size: `h-7 w-7 p-0` for icon-only
- Hover: Subtle background change

**Action Button Group**:

- Layout: `flex items-center gap-1`
- Buttons: Small icon buttons (refresh, settings, expand)

#### Form Patterns

**Input Fields**:

- Container: Standard Input component
- Styling: `border-violet-500/20 bg-gray-800/50 backdrop-blur-sm`
- Focus: Ring with `ring-violet-500`

**Select Dropdowns**:

- Trigger: `border-violet-500/20 bg-gray-800/50 backdrop-blur-sm`
- Content: `bg-popover` with border and shadow

#### Table Patterns

**Data Tables**:

- Container: Table component with custom styling
- Headers: `text-muted-foreground font-medium`
- Rows: `hover:bg-muted/50` for interactivity
- Borders: Subtle borders between rows

**Scrollable Tables**:

- Wrapper: `.scanner-table-wrapper` or `overflow-x-auto`
- Negative margins: `-mx-4 px-4 md:-mx-6 md:px-6` for full-width scrolling

#### Badge/Status Patterns

**Severity Badges**:

- Critical: `bg-red-700 text-white` or `bg-red-500/20 text-red-400`
- High: `bg-orange-700 text-white` or `bg-orange-500/20 text-orange-400`
- Medium: `bg-yellow-700 text-white` or `bg-yellow-500/20 text-yellow-400`
- Low: `bg-green-700 text-white` or `bg-green-500/20 text-green-400`
- Info: `bg-blue-700 text-white` or `bg-blue-500/20 text-blue-400`

**Status Indicators**:

- Online: Green accent
- Offline: Gray/muted
- Warning: Yellow/orange accent

### Animations & Transitions

#### Custom Animations

**pulse-slow**:

- Duration: `3s`
- Easing: `cubic-bezier(0.4, 0, 0.6, 1)`
- Usage: Slow pulsing effects for status indicators

**shimmer**:

- Duration: `3s`
- Type: `linear infinite`
- Effect: Background position animation for loading states
- Usage: Loading placeholders, skeleton screens

**pulse-glow**:

- Duration: `2s`
- Easing: `ease-in-out infinite`
- Effect: Box shadow pulse with violet glow
- Usage: Interactive elements, hover effects

**scan-line**:

- Duration: `2s`
- Easing: `ease-in-out infinite`
- Effect: Vertical line scan animation
- Usage: Scanner interface, loading indicators

**rotate-subtle**:

- Duration: `0.3s`
- Easing: `ease-in-out`
- Effect: Subtle rotation and scale
- Usage: Icon animations, hover effects

**icon-bounce**:

- Duration: `0.5s`
- Easing: `ease-in-out`
- Effect: Vertical bounce and scale
- Usage: Icon interactions, button presses

**fade-in-up**:

- Duration: `0.4s`
- Easing: `ease-out forwards`
- Effect: Fade in with upward motion
- Usage: Content reveals, modal appearances

#### Transition Patterns

**Color Transitions**:

- Standard: `transition-colors duration-200`
- Usage: Hover states, state changes

**All Transitions**:

- Standard: `transition-all duration-200` or `duration-300`
- Usage: Complex state changes, card interactions

**Hover States**:

- Border: `hover:border-violet-500/40` (increased opacity)
- Background: `hover:bg-violet-500/20` or `hover:bg-gray-900/70`
- Shadow: `hover:shadow-lg hover:shadow-violet-500/5`

#### Loading States

**Skeleton Loading**:

- Component: Skeleton with `animate-pulse`
- Styling: `bg-muted rounded-md`
- Usage: Content placeholders while loading

**Spinner Loading**:

- Icon: RefreshCw with `animate-spin`
- Usage: Action feedback, data refreshing

**Pulse Loading**:

- Animation: `animate-pulse`
- Usage: Background placeholders

### Design Tokens Reference

#### Border Radius

- **sm**: `0.125rem` (2px) - Small elements
- **md**: `0.375rem` (6px) - Default (calculated as `calc(var(--radius) - 2px)`)
- **lg**: `0.5rem` (8px) - Standard (`var(--radius)`)
- **xl**: `0.75rem` (12px) - Large elements
- **full**: `9999px` - Fully rounded (badges, pills)

**Common Usage**:

- Cards: `rounded-lg`
- Buttons: `rounded-md`
- Badges: `rounded-full` or `rounded-md`
- Inputs: `rounded-md`

#### Shadow Values

**Standard Shadows**:

- `shadow-sm`: Small shadow
- `shadow`: Default shadow
- `shadow-md`: Medium shadow
- `shadow-lg`: Large shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.1)`)
- `shadow-xl`: Extra large shadow
- `shadow-2xl`: Very large shadow

**Custom Shadows**:

- `shadow-black/20`: Black shadow with 20% opacity
- `shadow-violet-500/5`: Violet glow with 5% opacity
- `shadow-violet-500/10`: Violet glow with 10% opacity

**Box Shadow Patterns** (from scanner-section):

- Standard: `0 0 0 1px rgba(139, 92, 246, 0.05) inset, 0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(139, 92, 246, 0.03)`
- Primary: `0 0 0 1px rgba(139, 92, 246, 0.1) inset, 0 2px 4px rgba(0, 0, 0, 0.3), 0 12px 24px rgba(139, 92, 246, 0.08)`

#### Z-Index Scale

- **z-10**: Standard elevated content
- **z-20**: Page content layer
- **z-30**: Sticky headers, fixed navigation
- **z-40**: Dropdowns, popovers
- **z-50**: Modals, dialogs, tooltips

**Common Usage**:

- Page content: `z-20`
- Sticky headers: `z-30`
- Modals: `z-50`

#### Backdrop Blur

- **backdrop-blur-sm**: `4px` - Subtle blur
- **backdrop-blur**: `8px` - Standard blur
- **backdrop-blur-md**: `12px` - Medium blur
- **backdrop-blur-lg**: `16px` - Large blur

**Common Usage**:

- Cards: `backdrop-blur-sm`
- Headers: `backdrop-blur-sm`
- Overlays: `backdrop-blur` or `backdrop-blur-md`

#### Ring/Outline Values

**Focus Rings**:

- Standard: `ring-2 ring-ring ring-offset-2`
- Violet accent: `ring-violet-500`
- Usage: Form inputs, buttons, interactive elements

**Ring Patterns**:

- `ring-1 ring-violet-500/20`: Subtle ring decoration
- `ring-2 ring-violet-500/40`: Standard focus ring
- `ring-offset-2`: Offset for better visibility

### Usage Guidelines

#### When to Use Which Component

**Buttons**:

- Use `default` variant for primary actions
- Use `ghost` variant for icon-only actions (refresh, settings)
- Use `outline` variant for secondary actions
- Use `destructive` variant for delete/remove actions

**Cards**:

- Use `Card` component for standard content containers
- Use `DashboardCard` for dashboard widgets with actions
- Use `DashboardHeroCard` for prominent metric displays
- Use `.scanner-section` classes for scanner interface sections

**Badges**:

- Use standard `Badge` component for general status indicators
- Use custom severity badges for vulnerability severity
- Match badge colors to semantic meaning (red=critical, green=success)

**Tables**:

- Use `Table` component for structured data display
- Add hover states for interactive rows
- Use scrollable wrapper for wide tables

**Forms**:

- Use `Input` component for text inputs
- Use `Select` component for dropdowns
- Use `Label` component for form labels
- Group related fields with consistent spacing

#### Best Practices

**Color Usage**:

- Always use violet theme colors for primary actions and accents
- Use semantic colors (red, green, yellow, blue) for status indicators
- Maintain consistent opacity levels (20%, 30%, 40% for borders)
- Use dark backgrounds (`gray-900`, `gray-800`) with transparency

**Spacing**:

- Use consistent spacing scale (4px base unit)
- Maintain visual rhythm with `space-y-*` utilities
- Use responsive spacing (`p-4 md:p-6`)
- Group related elements with smaller gaps

**Typography**:

- Use `text-white` for primary text on dark backgrounds
- Use `text-violet-300` or `text-violet-400` for accents
- Use `text-gray-400` for secondary/muted text
- Maintain clear hierarchy with size and weight

**Components**:

- Always use ShadCN components as base, customize with Sirius styling
- Follow established patterns from dashboard and scanner pages
- Maintain consistency with existing component usage
- Use semantic HTML and accessibility features

**Animations**:

- Use subtle transitions (`duration-200` or `duration-300`)
- Apply animations sparingly for important interactions
- Use loading states (skeleton, spinner) for async operations
- Respect user preferences for reduced motion

#### Common Patterns

**Card with Header and Actions**:

```tsx
<Card className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-violet-400" />
      Title
    </CardTitle>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm">
        ...
      </Button>
    </div>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

**Section with Icon Header**:

```tsx
<div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
  <div className="mb-4 flex items-center gap-2">
    <Icon className="h-5 w-5 text-violet-400" />
    <h2 className="text-lg font-semibold text-violet-300">Section Title</h2>
  </div>
  {/* Content */}
</div>
```

**Interactive Button with Hover**:

```tsx
<button className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 backdrop-blur-sm transition-all hover:border-violet-500/40 hover:bg-gray-900/70">
  Content
</button>
```

#### Anti-Patterns to Avoid

**Color Anti-Patterns**:

- Don't use arbitrary colors outside the defined palette
- Don't mix light and dark mode colors incorrectly
- Don't use full opacity borders (always use opacity for depth)
- Don't use colors that don't match semantic meaning

**Spacing Anti-Patterns**:

- Don't use arbitrary spacing values (stick to scale)
- Don't mix spacing units (use Tailwind classes)
- Don't create inconsistent gaps between related elements
- Don't forget responsive spacing adjustments

**Component Anti-Patterns**:

- Don't create custom components when ShadCN equivalents exist
- Don't override ShadCN component styles unnecessarily
- Don't skip accessibility features (focus states, ARIA labels)
- Don't use inline styles when Tailwind classes work

**Animation Anti-Patterns**:

- Don't use excessive animations that distract from content
- Don't animate everything (use selectively)
- Don't ignore reduced motion preferences
- Don't use animations that don't serve a purpose

### Examples

#### Dashboard Page Patterns

The dashboard page (`sirius-ui/src/pages/dashboard.tsx`) exemplifies the 0.4.0 style:

**Glassmorphism Header**:

- Sticky header with `bg-gray-900/95 backdrop-blur-sm`
- Border: `border-b border-violet-500/20`
- Shadow: `shadow-lg shadow-black/20`
- Icon containers: `bg-violet-500/10 ring-2 ring-violet-500/20`

**Hero Cards**:

- Large metric displays with `DashboardHeroCard`
- Variants: `default`, `critical`, `success`
- Hover effects with gradient overlays

**Dashboard Cards**:

- Consistent card styling: `border-violet-500/20 bg-gray-900/50 backdrop-blur-sm`
- Header with icon and actions
- Loading states with skeletons
- Error states with red accent

**Grid Layouts**:

- Responsive grids: `grid gap-6 lg:grid-cols-3`
- Two-column spans: `lg:col-span-2`
- Consistent spacing throughout

#### Scanner Page Patterns

The scanner page (`sirius-ui/src/pages/scanner.tsx`) demonstrates scanner-specific patterns:

**Scanner Sections**:

- Use `.scanner-section` and `.scanner-section-primary` classes
- Consistent violet borders and backdrop blur
- Scrollable table wrappers for wide content

**Navigation Tabs**:

- Sticky navigation with glassmorphism
- Active state: `border-violet-500 text-violet-300`
- Inactive: `border-transparent text-gray-400 hover:text-gray-200`

**Section Headers**:

- Icon + title pattern
- Consistent spacing and typography
- Action buttons aligned right

## Troubleshooting

### FAQ

**Q: Which color should I use for primary actions?**
A: Use violet theme colors: `bg-violet-500/10 hover:bg-violet-500/20` with `border-violet-500/20` and `text-violet-400`. For buttons, use the `default` variant which uses `bg-primary`.

**Q: How do I create a glassmorphism effect?**
A: Use `bg-gray-900/50` or `bg-gray-800/50` with `backdrop-blur-sm` and a border like `border-violet-500/20`. Add `shadow-lg shadow-black/20` for depth.

**Q: What spacing should I use between sections?**
A: Use `space-y-8` for major sections, `space-y-6` for cards, and `space-y-4` for related items. Use `gap-6` for grid layouts.

**Q: How do I style severity badges?**
A: Use semantic colors: `bg-red-700 text-white` for critical, `bg-orange-700` for high, `bg-yellow-700` for medium, `bg-green-700` for low, `bg-blue-700` for info. Or use opacity variants: `bg-red-500/20 text-red-400`.

**Q: What's the difference between Card and DashboardCard?**
A: `Card` is the base ShadCN component for general content containers. `DashboardCard` is a specialized component with built-in loading states, error handling, and action buttons for dashboard widgets.

**Q: How do I create a sticky header?**
A: Use `sticky top-0 z-30` with `bg-gray-900/95 backdrop-blur-sm` and `border-b border-violet-500/20`. Add `shadow-lg shadow-black/20` for separation.

**Q: What animations should I use?**
A: Use `transition-colors duration-200` for color changes, `transition-all duration-200` for complex changes. Use `animate-pulse` for loading states, `animate-spin` for spinners.

**Q: How do I make tables scrollable?**
A: Wrap the table in a container with `overflow-x-auto` or use `.scanner-table-wrapper` class. Use negative margins (`-mx-4 px-4`) for full-width scrolling.

**Q: What z-index values should I use?**
A: Use `z-20` for page content, `z-30` for sticky headers, `z-40` for dropdowns, `z-50` for modals. Don't exceed `z-50` unless necessary.

**Q: How do I style form inputs?**
A: Use the `Input` component with custom classes: `border-violet-500/20 bg-gray-800/50 backdrop-blur-sm`. Focus states use `ring-violet-500`.

### Command Reference

```bash
# View Tailwind configuration
cat sirius-ui/tailwind.config.ts

# View global styles
cat sirius-ui/src/styles/globals.css

# Search for color usage patterns
grep -r "violet-500" sirius-ui/src/pages/

# Search for component usage
grep -r "DashboardCard" sirius-ui/src/components/

# Find spacing patterns
grep -r "space-y-8\|gap-6" sirius-ui/src/pages/
```

### Common Issues and Solutions

| Issue                     | Symptoms                       | Solution                                                                               |
| ------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| Colors don't match        | Inconsistent violet shades     | Use documented color values from tailwind.config.ts, use opacity syntax (`/20`, `/30`) |
| Spacing inconsistent      | Uneven gaps between elements   | Use Tailwind spacing scale (`gap-6`, `space-y-8`), avoid arbitrary values              |
| Glassmorphism not working | Solid backgrounds, no blur     | Ensure `backdrop-blur-sm` is present, use semi-transparent backgrounds (`/50`, `/20`)  |
| Components look different | Styling doesn't match examples | Check if using correct ShadCN component, verify custom classes match patterns          |
| Animations too fast/slow  | Transitions feel off           | Use standard durations (`duration-200`, `duration-300`), check easing functions        |
| Z-index conflicts         | Elements overlap incorrectly   | Use documented z-index scale, check stacking context                                   |
| Responsive breakpoints    | Layout breaks on mobile        | Use responsive utilities (`md:`, `lg:`), test at breakpoints                           |

### Debugging Steps

1. **Check Color Values**: Verify colors match documented values from `tailwind.config.ts`
2. **Verify Spacing**: Ensure spacing uses Tailwind scale, not arbitrary values
3. **Inspect Components**: Compare with exemplar pages (dashboard.tsx, scanner.tsx)
4. **Test Responsive**: Check behavior at documented breakpoints
5. **Validate Classes**: Ensure Tailwind classes are properly configured
6. **Check Opacity**: Verify opacity syntax (`/20`, `/30`) is correct

### Lessons Learned

**2025-01-03**: Established comprehensive 0.4.0 style guide based on dashboard and scanner page implementations. Key insight: Glassmorphism effects with violet accents create a distinctive, modern interface that maintains readability in dark mode.

**2025-01-03**: Documented extensive use of opacity for layering and depth. Lesson: Consistent opacity levels (20%, 30%, 40%) create visual hierarchy without overwhelming the interface.

**2025-01-03**: Identified scanner-specific CSS classes as important pattern. Benefit: Reusable classes (`.scanner-section`, `.scanner-section-primary`) ensure consistency across scanner interface.

## Related Documentation

- **[README.development.md](../README.development.md)**: Development workflow and standards
- **[ABOUT.documentation.md](../ABOUT.documentation.md)**: Documentation system standards
- **ShadCN UI Documentation**: Component API reference (external)
- **Tailwind CSS Documentation**: Utility class reference (external)

## LLM Context

This style guide documents the Sirius 0.4.0 UI design system. Key concepts for AI understanding:

- **Dark Mode First**: The system is designed primarily for dark mode, with light mode as secondary
- **Violet Theme**: Violet/purple colors are the primary brand identity throughout
- **Glassmorphism**: Extensive use of backdrop blur and transparency for modern aesthetic
- **ShadCN Foundation**: All components built on ShadCN UI, customized with Sirius styling
- **Consistent Patterns**: Dashboard and scanner pages serve as exemplars for all UI development
- **Design Tokens**: Standardized values for spacing, colors, shadows, borders, and animations
- **Component Library**: ShadCN components provide base functionality, custom components add Sirius-specific features

When generating UI code, always reference this guide for:

- Color choices (violet theme, semantic colors)
- Spacing values (Tailwind scale)
- Component selection (ShadCN vs custom)
- Design patterns (cards, sections, headers)
- Animation usage (subtle transitions, loading states)

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._



