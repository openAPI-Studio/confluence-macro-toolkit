# Confluence Macro Toolkit

A Forge app providing a collection of powerful macros for Atlassian Confluence.

## Macros

| Macro | Description | Data Storage |
|-------|-------------|--------------|
| **Mermaid Diagram** | Write Mermaid syntax, renders as SVG | Macro config |
| **Markdown** | Write GitHub-flavored Markdown, renders as HTML | Macro config |
| **Swagger / OpenAPI** | Paste OpenAPI JSON spec, renders interactive API docs | Macro config |
| **Draw.io Diagram** | Full draw.io editor, renders diagram on page | Forge Storage + Attachments |
| **Poll / Vote** | Create polls (single/multi/thumbs/emoji), collect votes | Forge Storage |
| **Mood** | Floating word cloud / emoji reactions visualization | Forge Storage |
| **Graph / Chart** | Bar, line, pie, doughnut, area charts with Chart.js | Macro config |
| **Typewriter** | Animate text with typewriter/word/line/fade effects | Macro config |
| **Carousel / Slideshow** | Image slideshow with transitions and auto-play | Page Attachments |

## Features

- **Admin Settings** — Toggle individual macros on/off at site level
- **Draw.io Warning** — External service warning, disabled by default
- **Theme Support** — Macros use Atlassian Design System CSS variables
- **Icons** — Custom SVG icons for each macro in editor and admin

## Project Structure

```
confluence-macro-toolkit/
├── manifest.yml                    # Forge app manifest
├── package.json                    # Root build scripts
├── src/index.js                    # Shared resolver (all backend logic)
└── static/
    ├── mermaid-macro/              # Mermaid render view
    ├── mermaid-config/             # Mermaid code editor + preview
    ├── markdown-macro/             # Markdown render view
    ├── markdown-config/            # Markdown editor + preview
    ├── swagger-macro/              # Swagger UI render
    ├── swagger-config/             # JSON spec editor
    ├── drawio-macro/               # Draw.io viewer (embed.diagrams.net)
    ├── drawio-config/              # Draw.io editor (embed.diagrams.net)
    ├── poll-macro/                 # Poll voting UI + results
    ├── poll-config/                # Poll creation (type/options/settings)
    ├── mood-macro/                 # Floating mood visualization
    ├── mood-config/                # Mood type selector
    ├── graph-macro/                # Chart.js chart render
    ├── graph-config/               # Chart editor + live preview
    ├── typewriter-macro/           # Animated text render
    ├── typewriter-config/          # Text + style + speed + theme
    ├── carousel-macro/             # Image slideshow
    ├── carousel-config/            # Image upload + style options
    └── admin-page/                 # Site-level macro toggle settings
```

## Setup

```bash
# Install root dependencies
npm install

# Build all macro UIs
npm run build:all

# Deploy to Atlassian
forge deploy

# Install on your site
forge install
```

## Macro Details

### Mermaid Diagram
- Fullscreen code editor with live SVG preview
- Theme-aware colors (light blue nodes, dark text)
- Renders client-side using bundled mermaid.js

### Markdown
- Fullscreen editor with live preview
- Supports GitHub Flavored Markdown (tables, strikethrough, etc.)
- Renders client-side using react-markdown + remark-gfm

### Swagger / OpenAPI
- Paste OpenAPI 3.0 JSON spec
- JSON validation before save
- Renders interactive API docs using swagger-ui-react

### Draw.io Diagram
- Full draw.io editor via embed.diagrams.net
- Diagram XML stored in Forge Storage
- SVG exported and rendered on published page
- XML also saved as page attachment for version history
- ⚠️ Uses external service — disabled by default in admin settings

### Poll / Vote
- **4 poll types:** Single answer, Multiple answers, Thumbs up/down, Emoji reactions
- Thumbs/Emoji: instant toggle voting (click to vote, click again to un-vote)
- Single/Multi: vote button + results with progress bars
- Click vote count to see voter names
- Optional "Allow revoke" for single/multi types
- Alignment options (left/center/right)
- One vote per user, enforced server-side

### Mood
- **2 modes:** Custom text (users type words) or Emoji set
- Floating animated visualization — bigger = more votes
- CSS float animation with randomized delays
- One vote per user, voting changes previous vote

### Graph / Chart
- **5 chart types:** Bar, Line, Pie, Doughnut, Area
- Fullscreen config with live preview
- Multiple datasets with individual color pickers
- Pie/Doughnut: per-slice color customization
- Toggle legend and grid
- Renders using Chart.js (canvas-based, no CSP issues)

### Typewriter
- **4 render styles:** Letter by letter, Word by word, Line by line, Fade in
- **4 speed options:** Fast (20ms), Medium (50ms), Slow (100ms), Very Slow (150ms)
- **7 themes:** None, Terminal, Retro Monitor, Matrix, Paper, Blueprint, Hacker
- Optional blinking cursor (persists after animation)
- Optional line numbers
- Live preview in config that responds to all setting changes

### Carousel / Slideshow
- Upload multiple images (saved as page attachments)
- Select from existing page attachments
- **4 button styles:** Arrows, Dots, Both, None
- **4 transitions:** Slide, Fade, Zoom, Flip
- Auto-play with configurable interval (2s/3s/5s/8s)
- Loop toggle

## Admin Settings

Access via: **Confluence Admin → Apps → Macro Toolkit Settings**

- Toggle each macro on/off for the entire site
- Draw.io disabled by default with external service warning
- Settings stored in Forge Storage

## Permissions

| Scope | Purpose |
|-------|---------|
| `read:confluence-content.summary` | Read page metadata |
| `read:confluence-content.all` | Read attachments |
| `read:confluence-user` | Resolve voter display names |
| `write:confluence-content` | Create/update content |
| `write:confluence-file` | Upload attachments |
| `storage:app` | Forge Storage for polls, mood, settings, draw.io |

## External Dependencies

| Service | Used By | Purpose |
|---------|---------|---------|
| `embed.diagrams.net` | Draw.io macro | Editor + viewer |

All other macros render entirely client-side with bundled libraries.

## Development

```bash
# Build a single macro
cd static/mermaid-macro && npm install && npm run dev

# Use Forge tunnel for live reload
forge tunnel

# View logs
forge logs
```

## Adding a New Macro

1. Create `static/<macro-name>/` and `static/<macro-name>-config/`
2. Add macro entry under `modules.macro` in `manifest.yml`
3. Add `resources` entries
4. Add build scripts to root `package.json`
5. Add to admin settings MACROS array
6. Add to DEFAULT_SETTINGS in resolver
7. Build & deploy

## Requirements

- Node.js 22+
- [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/)
- An Atlassian cloud developer site
