import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

view.theme.enable();

const MACROS = [
  { key: 'mermaid-diagram', name: 'Mermaid Diagram', description: 'Render Mermaid diagrams', defaultEnabled: true, icon: '🧜' },
  { key: 'markdown-renderer', name: 'Markdown', description: 'Render Markdown content', defaultEnabled: true, icon: '📝' },
  { key: 'swagger-api-docs', name: 'Swagger / OpenAPI', description: 'Render API documentation from OpenAPI specs', defaultEnabled: true, icon: '🔌' },
  { key: 'drawio-diagram', name: 'Draw.io Diagram', description: 'Create and edit diagrams with Draw.io', defaultEnabled: false, icon: '🎨', warning: 'Uses external service (embed.diagrams.net). Diagram data is sent externally.' },
  { key: 'poll-vote', name: 'Poll / Vote', description: 'Create polls and collect votes', defaultEnabled: true, icon: '🗳️' },
  { key: 'mood-macro', name: 'Mood', description: 'Visualize team mood with floating bubbles', defaultEnabled: true, icon: '🌤️' },
  { key: 'graph-chart', name: 'Graph / Chart', description: 'Render interactive charts and graphs', defaultEnabled: true, icon: '📊' },
  { key: 'typewriter-macro', name: 'Typewriter', description: 'Animate text with typewriter effects', defaultEnabled: true, icon: '⌨️' },
  { key: 'plantuml-macro', name: 'PlantUML', description: 'Render UML diagrams from PlantUML syntax', defaultEnabled: false, icon: '🌱', warning: 'Uses external service (plantuml.com). Source code is sent externally during editing.' },
  { key: 'excalidraw-wireframe', name: 'Wireframe / Whiteboard', description: 'Create wireframes and sketches', defaultEnabled: false, icon: '✏️', warning: 'Shape library downloads from libraries.excalidraw.com.' },
  { key: 'sticky-note', name: 'Sticky Note', description: 'Colorful sticky notes with handwritten style', defaultEnabled: true, icon: '📌' },
  { key: 'spoiler-reveal', name: 'Spoiler / Reveal', description: 'Hide content with animated reveal on click', defaultEnabled: true, icon: '🔒' },
  { key: 'clock-gadget', name: 'Clock', description: 'Display configurable clock gadgets (analog/digital)', defaultEnabled: true, icon: '🕐' },
];

export default function App() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((result) => {
      const s = {};
      MACROS.forEach((m) => { s[m.key] = result[m.key] !== undefined ? result[m.key] : m.defaultEnabled; });
      setSettings(s);
    });
  }, []);

  const toggle = (key) => { setSettings((prev) => ({ ...prev, [key]: !prev[key] })); setSaved(false); };

  const save = async () => { setSaving(true); await invoke('saveSettings', { settings }); setSaving(false); setSaved(true); };

  if (!settings) return <div style={{ padding: 32, color: 'var(--ds-text-subtlest, #626F86)' }}>Loading settings...</div>;

  const enabled = MACROS.filter((m) => settings[m.key]);
  const disabled = MACROS.filter((m) => !settings[m.key]);

  return (
    <div style={{ padding: '24px 32px', fontFamily: 'var(--ds-font-family-body, -apple-system, BlinkMacSystemFont, sans-serif)', color: 'var(--ds-text, #172B4D)', maxWidth: 640, margin: '0 auto' }}>

      {/* Header stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, padding: '12px 16px', background: 'var(--ds-background-success, #DCFFF1)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-text-success, #216E4E)' }}>{enabled.length}</div>
          <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)' }}>Enabled</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', background: 'var(--ds-background-neutral, #F7F8F9)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-text-subtlest, #626F86)' }}>{disabled.length}</div>
          <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)' }}>Disabled</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', background: 'var(--ds-background-information, #E9F2FF)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-link, #0C66E4)' }}>{MACROS.length}</div>
          <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)' }}>Total</div>
        </div>
      </div>

      {/* Macro list */}
      <div style={{ border: '1px solid var(--ds-border, #091E4224)', borderRadius: 8, overflow: 'hidden' }}>
        {MACROS.map((macro, i) => (
          <div key={macro.key} style={{
            padding: '14px 16px',
            borderBottom: i < MACROS.length - 1 ? '1px solid var(--ds-border, #091E4224)' : 'none',
            background: settings[macro.key] ? 'var(--ds-surface, #FFFFFF)' : 'var(--ds-surface-sunken, #F7F8F9)',
            transition: 'background 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{macro.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-text, #172B4D)' }}>{macro.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{macro.description}</div>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 20, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={settings[macro.key]} onChange={() => toggle(macro.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', inset: 0,
                  background: settings[macro.key] ? 'var(--ds-background-brand-bold, #0C66E4)' : 'var(--ds-background-neutral-bold, #8993A5)',
                  borderRadius: 10, transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: settings[macro.key] ? 20 : 2,
                    width: 16, height: 16, background: '#fff', borderRadius: '50%',
                    transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }} />
                </span>
              </label>
            </div>
            {macro.warning && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--ds-background-warning, #FFF7D6)', border: '1px solid var(--ds-border-warning, #F5CD47)', borderRadius: 4, fontSize: 11, color: 'var(--ds-text-warning, #A54800)', lineHeight: 1.4 }}>
                ⚠️ {macro.warning}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save bar */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={save} disabled={saving} style={{
            padding: '8px 20px', background: 'var(--ds-background-brand-bold, #0C66E4)', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500,
            opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          {saved && <span style={{ color: 'var(--ds-text-success, #216E4E)', fontSize: 12 }}>✓ Saved</span>}
        </div>
        <a href="https://ko-fi.com/openpost" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--ds-link, #0C66E4)', textDecoration: 'none' }}>☕ Support us</a>
      </div>
    </div>
  );
}
