# Design System

**Colours:**
- Navy (Primary): `navy-900` #0F2A3F, `navy-700` #1B4460, `navy-100` #E6EEF3
- Forest (Secondary): `forest-700` #1E5631, `forest-500` #2F7D4A, `forest-100` #E8F1EA
- Amber (Accent): `amber-500` #C8891A, `amber-100` #FBF1DC
- Neutrals: `bg` #F7F6F3, `surface` #FFFFFF, `border` #E3E0D8, `muted` #5F6259, `text` #1F2421
- Semantic: `success` #2F7D4A, `warning` #C8891A, `danger` #B3372F, `info` #1B4460

**Typography:**
- Headings: "Source Serif 4" (600)
- Body/UI: "Inter" (400/500/600)
- Numbers: Tabular numbers
- Note: Self-host via `@fontsource`. Base text 14px, table text 13px, line-height 1.5.

**Spacing & Radii:**
- Spacing: 4px scale
- Border Radius: 6px (controls), 8px (cards)
- Borders: 1px solid
- Shadows: Minimal (one subtle card shadow only)
- Focus Ring: 2px `navy-700` offset 2px

**Components:**
- `Button`: primary, secondary, ghost, danger (sm, md)
- `Card`: standard container
- `Table`: standard data display
- `Badge`: neutral, success, warning, danger, info + "Illustrative" and "Modelled" variants
- `EmptyState`: standard empty view
- `Skeleton`: loading placeholder
- `ErrorState`: standard error view with retry action
- `CitationPill`: for RAG answers
- `Tabs`: navigation
- `Modal` / `Drawer`: overlays
- `Toast`: notifications

**Layout Rules:**
- Left sidebar nav + top bar
- Max content width: 1280px
- Page header pattern: Title, description, actions
- Data-dense but breathable
- Chart colours strictly from tokens

**Content Rules:**
- NO Lorem Ipsum
- Indian number formatting (en-IN)
- Dates: DD MMM YYYY
- Always include "Illustrative data" footnote/badge where seeded synthetic data is used.
