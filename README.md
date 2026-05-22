# Confluence Macro Toolkit

A Forge app providing a collection of macros for Atlassian Confluence.

## Macros

| Macro | Description |
|-------|-------------|
| **Mermaid Diagram** | Write Mermaid syntax, renders as SVG on the page |
| **Markdown** | Write GitHub-flavored Markdown, renders as HTML |

## Project Structure

```
confluence-macro-toolkit/
├── manifest.yml              # Forge app manifest
├── package.json              # Root dependencies & build scripts
├── src/resolvers/index.js    # Shared backend resolver
└── static/
    ├── mermaid-macro/        # Mermaid render view
    ├── mermaid-config/       # Mermaid editor (config modal)
    ├── markdown-macro/       # Markdown render view
    └── markdown-config/      # Markdown editor (config modal)
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

## Development

```bash
# Build a single macro
cd static/mermaid-macro && npm install && npm run dev

# Use Forge tunnel for live reload
forge tunnel
```

## Adding a New Macro

1. Create `static/<macro-name>/` and `static/<macro-name>-config/` directories
2. Add a new entry under `modules.macro` in `manifest.yml`
3. Add corresponding `resources` entries
4. Add build script to root `package.json`
5. Build & deploy

## Requirements

- Node.js 18+
- [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/)
- An Atlassian cloud developer site
