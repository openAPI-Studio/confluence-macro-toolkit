# Confluence Macro Toolkit Lite

A Forge app providing a collection of powerful macros for Atlassian Confluence.

## Macros

| Macro | Description | Data Storage |
|-------|-------------|--------------|
| **Mermaid Diagram** | Write Mermaid syntax, renders as SVG | Macro config |
| **Markdown** | Write GitHub-flavored Markdown, renders as HTML | Macro config |
| **Poll / Vote** | Create polls (single/multi/thumbs/emoji), collect votes | Forge Storage |
| **Mood** | Floating word cloud / emoji reactions visualization | Forge Storage |
| **Graph / Chart** | Bar, line, pie, doughnut, area charts with Chart.js | Macro config |
| **Typewriter** | Animate text with typewriter/word/line/fade effects | Macro config |
| **Sticky Note** | Colorful sticky notes with handwritten style, pins, and tape | Macro config |
| **Spoiler / Reveal** | Hidden content revealed on click with fade animation | Macro config |
| **Clock** | Analog or digital clock with timezone support and patterns | Macro config |
| **Stopwatch** | Interactive stopwatch with lap tracking (ring/classic/flip) | Macro config |

## Features

- **Admin Settings** — Toggle individual macros on/off at site level
- **Theme Support** — All macros use Atlassian Design System CSS variables (light + dark mode)
- **Icons** — Custom SVG icons for each macro in editor and admin
- **Live Preview** — Most config panels include split-view live preview
- **Patterns** — Visual themes (Solid, Gradient, Dark, Minimal, Neon) for Clock and Stopwatch
- **Color Palette** — 10-color accent palette across compatible macros

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
    ├── poll-macro/                 # Poll voting UI + results
    ├── poll-config/                # Poll creation (type/options/settings)
    ├── mood-macro/                 # Floating mood visualization
    ├── mood-config/                # Mood type selector
    ├── graph-macro/                # Chart.js chart render
    ├── graph-config/               # Chart editor + live preview
    ├── typewriter-macro/           # Animated text render
    ├── typewriter-config/          # Text + style + speed + theme
    ├── sticky-macro/               # Sticky note render
    ├── sticky-config/              # Sticky note editor (color, size, font, pin/tape)
    ├── spoiler-macro/              # Spoiler/reveal content render
    ├── spoiler-config/             # Spoiler editor (title, style, animation)
    ├── clock-macro/                # Clock render (analog/digital)
    ├── clock-config/               # Clock config (timezone, pattern, color)
    ├── stopwatch-macro/            # Stopwatch render (ring/classic/flip)
    ├── stopwatch-config/           # Stopwatch config (style, color, label)
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
Lets you write Mermaid diagram syntax and renders it as a visual diagram (flowcharts, sequence diagrams, Gantt charts, etc.) directly on your Confluence page.

- Fullscreen split-view editor with live preview
- Templates for common diagram types (flowchart, sequence, class, state, Gantt, pie, ER, git graph)
- Export to SVG or PNG
- Zoom controls and height/zoom settings
- Dark mode aware rendering

---

### Markdown
Renders GitHub-flavored Markdown content on your Confluence page.

- Split-view editor with live preview
- Tables, code blocks (with syntax highlighting), strikethrough, task lists
- Min-height and default zoom settings

---

### Poll / Vote
Creates interactive polls that users can vote on directly from the published page.

- **Single Answer** — radio buttons, one choice
- **Multiple Answers** — checkboxes, multiple choices
- **Thumbs Up/Down** — 👍👎 toggle buttons
- **Emoji Reactions** — custom emoji toggle buttons
- Real-time results with voter display names
- Allow/disallow vote revocation

---

### Mood
Creates a live "mood board" visualization where team members can express their mood.

- **Custom Text** — users type their own word/phrase (max 20 chars)
- **Emoji Set** — users pick from preset emojis
- Entries float and grow larger with more votes (word cloud effect)
- Optional title

---

### Graph / Chart
Creates interactive charts and graphs using Chart.js.

- Chart types: Bar, Line, Pie, Doughnut, Area
- Multiple datasets with individual colors
- Toggle legend and grid visibility
- Hover tooltips on published page
- Live preview in config

---

### Typewriter
Animates text with a typing effect when the page loads.

- Styles: Typewriter (letter by letter), Word by word, Line by line, Fade in
- Speed: Fast, Medium, Slow, Very Slow
- Themes: None, Terminal, Retro Monitor, Matrix, Paper, Blueprint, Hacker
- Optional blinking cursor and line numbers
- Live preview in config

---

### Sticky Note
Adds colorful sticky notes to your Confluence page with a handwritten aesthetic.

- 7 color presets + custom color picker
- Sizes: Small, Medium, Large, Full Width
- Fonts: Handwritten, Sans-serif, Serif, Monospace
- Attachments: Tape (with color options), Pin, or None
- Text alignment and spacing controls
- Live preview

---

### Spoiler / Reveal
Hides content behind a clickable bar that reveals text with animation.

- Customizable reveal title text
- Fade animation on reveal
- Configurable styling

---

### Clock
Displays analog or digital clocks with timezone support.

- Types: Analog (canvas-drawn) or Digital
- 15 timezone presets (UTC, major cities worldwide)
- 5 patterns: Solid, Gradient, Dark, Minimal, Neon
- 10-color accent palette
- Multi-clock support (1-4 clocks side by side)
- Alignment options (left, center, right)
- Custom labels per clock

---

### Stopwatch
Interactive stopwatch with lap tracking and multiple visual styles.

- Styles: Ring (circular progress), Classic (button controls), Flip (digit cards)
- Start/Pause/Resume/Reset/Lap controls
- Lap history with best/worst highlighting
- 5 patterns: Solid, Gradient, Dark, Minimal, Neon
- 10-color accent palette
- Optional label

---

## Admin Settings

Access via: **Confluence Admin → Apps → Macro Toolkit Settings**

- Toggle each macro on/off for the entire site
- Settings stored in Forge Storage

## Permissions

| Scope | Purpose |
|-------|---------|
| `read:confluence-content.summary` | Read page metadata |
| `read:confluence-user` | Resolve voter display names |
| `write:confluence-content` | Create/update content |
| `storage:app` | Forge Storage for polls, mood, settings |

## Development

```bash
# Build a single macro
cd static/mermaid-macro && npm install && npm run build

# Use Forge tunnel for live reload
forge tunnel

# View logs
forge logs
```

## Requirements

- Node.js 22+
- [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/)
- An Atlassian cloud developer site

## Known Issues & Limitations

| Issue | Details |
|-------|---------|
| **Dark mode container** | Forge's iframe container may show white background in dark mode. Macro content adapts correctly. |
| **Macro config size limit** | Forge macro config has a payload size limit (~200KB). Very complex Mermaid/Markdown content may hit this. |
| **Ghost macros after rename** | Renaming/removing macro keys leaves stale entries in editor. Fix: `forge uninstall` then `forge install`. |

## License

Apache-2.0
