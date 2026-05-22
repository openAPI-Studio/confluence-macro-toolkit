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
**What it does:** Lets you write Mermaid diagram syntax and renders it as a visual diagram (flowcharts, sequence diagrams, Gantt charts, etc.) directly on your Confluence page.

**How to use:**
1. Type `/Mermaid` in the editor
2. A fullscreen editor opens with a code panel (left) and live preview (right)
3. Write your Mermaid syntax (e.g., `graph TD; A-->B; B-->C;`)
4. See the diagram update in real-time as you type
5. Click Save — the diagram renders on the published page

---

### Markdown
**What it does:** Renders GitHub-flavored Markdown content on your Confluence page, supporting tables, code blocks, strikethrough, task lists, and more.

**How to use:**
1. Type `/Markdown` in the editor
2. A fullscreen editor opens with a text panel (left) and live preview (right)
3. Write your Markdown content
4. Click Save — the formatted content renders on the published page

---

### Swagger / OpenAPI
**What it does:** Renders interactive API documentation from an OpenAPI/Swagger JSON specification, complete with endpoint details, request/response schemas, and try-it-out functionality.

**How to use:**
1. Type `/Swagger` in the editor
2. Paste your OpenAPI 3.0 JSON spec into the editor
3. The editor validates your JSON in real-time (shows errors if invalid)
4. Click Save — the full Swagger UI renders on the published page

---

### Draw.io Diagram
**What it does:** Provides a full draw.io diagramming editor embedded in Confluence. Create flowcharts, architecture diagrams, wireframes, and more with draw.io's complete toolset.

**How to use:**
1. Type `/Draw.io` in the editor
2. The draw.io editor opens in fullscreen
3. Create your diagram using draw.io's tools
4. Click Save & Exit — the diagram renders on the published page
5. Edit again to modify — all pages and layers are preserved

⚠️ **Note:** This macro uses `embed.diagrams.net` (external service). Must be enabled by an admin in Macro Toolkit Settings.

---

### Poll / Vote
**What it does:** Creates interactive polls that users can vote on directly from the published page. Supports multiple poll types and shows real-time results with voter tracking.

**How to use:**
1. Type `/Poll` in the editor
2. Choose a poll type:
   - **Single Answer** — radio buttons, one choice
   - **Multiple Answers** — checkboxes, multiple choices
   - **Thumbs Up/Down** — 👍👎 toggle buttons
   - **Emoji Reactions** — custom emoji toggle buttons
3. Enter your question and options (not needed for thumbs/emoji)
4. Optionally set alignment and allow vote revocation
5. Click Save — users can vote on the published page
6. Click vote counts to see who voted for what

---

### Mood
**What it does:** Creates a live "mood board" visualization where team members can express their mood. Entries float and grow larger as more people vote for them, creating a dynamic word cloud effect.

**How to use:**
1. Type `/Mood` in the editor
2. Choose a type:
   - **Custom Text** — users type their own word/phrase (max 20 chars)
   - **Emoji Set** — users pick from preset emojis
3. Optionally add a title
4. Click Save — on the published page:
   - Custom: users type a mood and submit, or click existing floating words to vote
   - Emoji: users click emoji buttons to vote
5. More votes = bigger text/emoji in the visualization

---

### Graph / Chart
**What it does:** Creates interactive charts and graphs using Chart.js. Supports multiple chart types with customizable colors, datasets, and display options.

**How to use:**
1. Type `/Graph` in the editor
2. A fullscreen editor opens with controls (left) and live preview (right)
3. Select chart type: Bar, Line, Pie, Doughnut, or Area
4. Enter labels (comma-separated, e.g., `Jan, Feb, Mar, Apr`)
5. Add datasets with name, color, and values
   - For Pie/Doughnut: one set of values + per-slice colors
   - For others: multiple datasets with individual colors
6. Toggle legend and grid visibility
7. Click Save — the interactive chart renders on the published page (hover for tooltips)

---

### Typewriter
**What it does:** Animates text with a ChatGPT-style typing effect when the page loads. Choose from multiple animation styles and visual themes to create engaging content reveals.

**How to use:**
1. Type `/Typewriter` in the editor
2. Choose a render style:
   - **Typewriter** — letter by letter with blinking cursor
   - **Word by word** — reveals one word at a time
   - **Line by line** — reveals one line at a time
   - **Fade in** — entire text fades in smoothly
3. Choose speed: Fast, Medium, Slow, or Very Slow
4. Choose a theme: None, Terminal, Retro Monitor, Matrix, Paper, Blueprint, or Hacker
5. Toggle blinking cursor (stays after animation) and line numbers
6. Watch the live preview to see your settings in action
7. Enter your content and click Save
8. The animation plays every time someone views the page

---

### Carousel / Slideshow
**What it does:** Displays multiple images in an animated slideshow with navigation controls. Images are stored as page attachments for version control.

**How to use:**
1. Type `/Carousel` in the editor
2. Upload images using the file picker, or select from existing page attachments
3. Configure display options:
   - **Button Style** — Arrows, Dots, Both, or None
   - **Transition** — Slide, Fade, Zoom, or Flip
   - **Auto-play** — toggle + set interval (2s/3s/5s/8s)
   - **Loop** — toggle infinite looping
4. Click Save — the slideshow renders on the published page
5. Users can navigate with arrows/dots or let it auto-play

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
