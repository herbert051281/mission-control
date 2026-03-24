# Styling & Design Tokens

## Design Token System

```css
/* src/styles/tokens.css */

:root {
  /* Color Palette (Dark Premium Control Room) */
  --color-bg-primary: #0A0F1A;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #0F172A;
  --color-border: #1F2937;
  --color-border-subtle: #0F172A;

  /* Accent Colors */
  --color-accent-primary: #22D3EE; /* Cyan */
  --color-accent-secondary: #8B5CF6; /* Purple */
  --color-success: #22C55E; /* Green */
  --color-warning: #F59E0B; /* Amber */
  --color-error: #EF4444; /* Red */

  /* Text Colors */
  --color-text-primary: #E5E7EB;
  --color-text-muted: #94A3B8;
  --color-text-subtle: #64748B;

  /* Semantic Color Pairs */
  --color-accent-primary-light: #06B6D4;
  --color-accent-primary-dark: #0891B2;
  --color-accent-secondary-light: #A78BFA;
  --color-accent-secondary-dark: #7C3AED;

  /* Opacity Helpers */
  --color-overlay-dark: rgba(10, 15, 26, 0.95);
  --color-overlay-light: rgba(226, 232, 240, 0.05);

  /* Typography */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-family-mono: 'Menlo', 'Monaco', 'Courier New', monospace;

  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-relaxed: 1.6;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
  --shadow-inner: inset 0 1px 2px 0 rgba(0, 0, 0, 0.3);

  /* Z-Index Scale */
  --z-base: 0;
  --z-sticky: 10;
  --z-dropdown: 100;
  --z-modal-backdrop: 200;
  --z-modal: 201;
  --z-popover: 300;
  --z-tooltip: 400;

  /* Transitions */
  --transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slowest: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Grid & Layout */
  --grid-unit: 8px;
  --container-max-width: 1600px;
}

/* Dark Mode (Default) */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}
```

---

## CSS Module Structure

### src/styles/layout.module.css
```css
.mission_control {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  overflow: hidden;
}

.mission_control__main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-row: 2;
  grid-column: 1 / -1;
  overflow: hidden;
}

/* Top Bar */
.top_bar {
  grid-column: 1 / -1;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  z-index: var(--z-sticky);
  gap: var(--space-xl);
}

.top_bar__left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  min-width: 200px;
}

.top_bar__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: 0;
  letter-spacing: -0.5px;
}

.icon_mission_control {
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.top_bar__center {
  flex: 1;
  max-width: 400px;
}

.top_bar__right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

/* Left Navigation Rail */
.nav_rail {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  width: 64px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  transition: width var(--transition-base);
  overflow: hidden;
}

.nav_rail--expanded {
  width: 200px;
}

.nav_rail__header {
  padding: var(--space-md);
  display: flex;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}

.nav_rail__toggle {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-sm);
  font-size: var(--font-size-lg);
  transition: color var(--transition-base);
}

.nav_rail__toggle:hover {
  color: var(--color-accent-primary);
}

.nav_rail__items {
  list-style: none;
  padding: var(--space-sm) 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.nav_item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-sm);
  margin: 0 var(--space-sm);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-base);
  white-space: nowrap;
}

.nav_item:hover {
  color: var(--color-accent-primary);
  background: rgba(34, 211, 238, 0.05);
}

.nav_item--active {
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  background: rgba(34, 211, 238, 0.1);
}

.nav_item__icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.nav_item__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.nav_rail__footer {
  padding: var(--space-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
}

.nav_rail__profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-base);
}

.nav_rail__profile:hover {
  border-color: var(--color-accent-primary);
  background: rgba(34, 211, 238, 0.1);
}

/* Main Content Area */
.main_content_area {
  grid-column: 2;
  grid-row: 2;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-lg);
  background: var(--color-bg-primary);
}

/* Approvals Panel */
.approvals_panel {
  grid-column: 3;
  grid-row: 2;
  width: 320px;
  background: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.approvals_panel__header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.approvals_panel__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.approvals_panel__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.approvals_panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  text-align: center;
}
```

### src/styles/components.module.css
```css
/* Mission Card */
.mission_card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-base);
  user-select: none;
}

.mission_card:hover {
  background: rgba(34, 211, 238, 0.05);
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-md);
}

.mission_card:active {
  transform: translateY(1px);
}

.mission_card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.mission_card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.mission_card__status {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.mission_card__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-sm) 0;
  line-height: var(--line-height-normal);
}

.mission_card__agents {
  display: flex;
  gap: var(--space-xs);
  margin: var(--space-md) 0;
  flex-wrap: wrap;
}

.mission_card__agent_badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-accent-secondary);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.mission_card__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  margin-top: var(--space-sm);
}

.mission_card__error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #FCA5A5;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  margin-top: var(--space-md);
  display: flex;
  gap: var(--space-xs);
  align-items: flex-start;
}

/* Agent Card */
.agent_card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all var(--transition-base);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 280px;
}

.agent_card:hover {
  border-color: var(--color-accent-primary);
  background: rgba(34, 211, 238, 0.05);
  box-shadow: var(--shadow-lg);
}

.agent_card--selected {
  border-color: var(--color-accent-primary);
  background: rgba(34, 211, 238, 0.1);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

.agent_card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.agent_card__title_section {
  flex: 1;
}

.agent_card__name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-xs) 0;
  letter-spacing: -0.5px;
}

.agent_card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agent_card__status_icon {
  font-size: 10px;
  line-height: 1;
}

.agent_card__menu {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: 0;
  transition: color var(--transition-base);
}

.agent_card__menu:hover {
  color: var(--color-accent-primary);
}

.agent_card__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  font-size: var(--font-size-xs);
}

.agent_card__meta_item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent_card__meta_label {
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agent_card__meta_value {
  color: var(--color-accent-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.agent_card__current_task,
.agent_card__last_task {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: rgba(139, 92, 246, 0.05);
}

.agent_card__task_label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.agent_card__task_description {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
  word-break: break-word;
}

.agent_card__task_time {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  display: block;
}

.agent_card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.agent_card__stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent_card__stat_value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-primary);
}

.agent_card__stat_label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.agent_card__progress {
  margin-top: var(--space-sm);
}

.agent_card__progress_bar {
  width: 100%;
  height: 3px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.agent_card__progress_fill {
  height: 100%;
  background: var(--color-accent-primary);
  border-radius: 2px;
  transition: width var(--transition-base);
}

/* Pipeline Stage */
.pipeline_stage {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  gap: var(--space-md);
}

.pipeline_stage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-md);
}

.pipeline_stage__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.pipeline_stage__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.pipeline_stage__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 200px;
  overflow-y: auto;
  flex: 1;
}

/* Activity Entry */
.activity_entry {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  align-items: center;
}

.activity_entry__timestamp {
  color: var(--color-text-subtle);
  font-family: var(--font-family-mono);
  min-width: 70px;
}

.activity_entry__agent {
  color: var(--color-accent-secondary);
  font-weight: var(--font-weight-semibold);
  min-width: 50px;
}

.activity_entry__content {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-primary);
}

.activity_entry__status {
  font-weight: var(--font-weight-bold);
}

.activity_entry__action {
  flex: 1;
  word-break: break-word;
}

.activity_entry__mission_ref {
  color: var(--color-text-muted);
}

/* Approval Item */
.approval_item {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  font-size: var(--font-size-sm);
}

.approval_item__header {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
  align-items: flex-start;
}

.approval_item__mission {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.approval_item__type {
  display: inline-block;
  background: var(--color-accent-secondary);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.approval_item__description {
  color: var(--color-text-muted);
  margin: var(--space-sm) 0;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
}

.approval_item__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--space-md) 0;
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
}

.approval_item__risk {
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.approval_item__expires {
  color: var(--color-text-subtle);
}

.approval_item__actions {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-xs);
  margin-top: var(--space-md);
}

.approval_item__btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.approval_item__btn--approve {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.approval_item__btn--approve:hover {
  opacity: 0.9;
  box-shadow: var(--shadow-md);
}

.approval_item__btn--deny {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.approval_item__btn--deny:hover {
  opacity: 0.9;
  box-shadow: var(--shadow-md);
}

.approval_item__btn--details {
  background: transparent;
  color: var(--color-text-muted);
}

.approval_item__btn--details:hover {
  color: var(--color-accent-primary);
}

.approval_item__details {
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.approval_item__details pre {
  margin: 0;
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  color: var(--color-accent-secondary);
}

/* Status Badges */
.status_badge {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
}

.status_badge:hover {
  border-color: currentColor;
}

.status_badge__icon {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.status_badge__label {
  font-weight: var(--font-weight-semibold);
}

.status_badge__detail {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Health Summary */
.health_summary {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.health_summary__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-lg) 0;
  color: var(--color-text-primary);
}

.health_summary__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.health_summary__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.health_summary__item_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.health_summary__item_label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.health_summary__item_value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-primary);
}

.health_summary__progress_bar {
  width: 100%;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.health_summary__progress_fill {
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-base), background-color var(--transition-base);
}

.health_summary__item_detail {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
}

.health_summary__metric {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Scrollbar Styling */
.nav_rail__items::-webkit-scrollbar,
.activity_feed__container::-webkit-scrollbar,
.approvals_panel__list::-webkit-scrollbar,
.pipeline_stage__cards::-webkit-scrollbar,
.main_content_area::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* Focus States (Accessibility) */
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* Loading & Skeleton */
.skeleton_loader {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    rgba(139, 92, 246, 0.1) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## Dark Mode & Responsive Behavior

```css
/* Responsive Adjustments */
@media (max-width: 1200px) {
  .mission_control__main {
    grid-template-columns: auto 1fr;
  }

  .approvals_panel {
    display: none; /* Move to modal on mobile */
  }

  .agent_grid__container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .nav_rail {
    width: 56px;
  }

  .nav_rail--expanded {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: var(--z-modal);
  }

  .top_bar {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .top_bar__center {
    width: 100%;
  }

  .main_content_area {
    padding: var(--space-md);
  }

  .pipeline_stages {
    grid-auto-flow: column;
    overflow-x: auto;
  }

  .agent_grid__container {
    grid-template-columns: 1fr;
  }
}

/* Print Styles */
@media print {
  .nav_rail,
  .top_bar,
  .approvals_panel,
  .activity_feed {
    display: none;
  }

  .main_content_area {
    padding: 0;
    background: white;
    color: black;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
