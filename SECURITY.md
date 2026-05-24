# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Yes             |
| Older   | ❌ No              |

Only the latest deployed version receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@openapi.studio**

Or use GitHub's private vulnerability reporting:
https://github.com/openAPI-Studio/confluence-macro-toolkit/security/advisories/new

### What to include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline:
- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix timeline:** Depends on severity, typically within 14 days for critical issues

## Security Considerations

### External Services
The following macros communicate with external services when **enabled by an admin**:

| Macro | Service | Data Sent |
|-------|---------|-----------|
| Draw.io | embed.diagrams.net | Diagram XML during editing/viewing |
| PlantUML | www.plantuml.com | PlantUML source code during editing |

These macros are **disabled by default** and require explicit admin opt-in. A warning is displayed in the admin settings.

### Data Storage
- **Forge Storage:** Poll votes, mood data, draw.io diagrams, admin settings
- **Macro Config:** Mermaid code, Markdown text, Swagger specs, chart data, typewriter text
- **Page Attachments:** Draw.io XML files

All data is stored within Atlassian's infrastructure and scoped to the app installation.

### Permissions
This app requests the minimum scopes required:
- `read:confluence-content.summary` — Read page metadata
- `read:confluence-content.all` — Read attachments
- `read:confluence-user` — Resolve voter display names
- `write:confluence-content` — Create/update content
- `write:confluence-file` — Upload attachments
- `storage:app` — Forge Storage access

### Content Security Policy
The app operates within Forge's strict CSP. The `unsafe-inline` styles permission is required for Draw.io rendering. External frame access is limited to `embed.diagrams.net`.

## Best Practices for Admins
1. Only enable Draw.io and PlantUML macros if your organization permits external data sharing
2. Review the admin settings page regularly
3. Keep the app updated to the latest version
