import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

view.theme.enable();

const MACROS = [
  { key: 'mermaid-diagram', name: 'Mermaid Diagram', description: 'Render Mermaid diagrams', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg"><path d="M490.16,84.61C490.16,37.912 452.248,0 405.55,0L84.61,0C37.912,0 0,37.912 0,84.61L0,405.55C0,452.248 37.912,490.16 84.61,490.16L405.55,490.16C452.248,490.16 490.16,452.248 490.16,405.55L490.16,84.61Z" style="fill:#ff3670;"/><path d="M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z" style="fill:white;fill-rule:nonzero;"/></svg>' },
  { key: 'markdown-renderer', name: 'Markdown', description: 'Render Markdown content', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="-10 -5 1034 1034" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M922 319q-1 0-2 1h-11v0h-836q-18 0-33.5 8.5t-25.5 22.5q-17 26-13 57v461q1 18 11 32.5t24 22.5q25 14 55 10v1l843-1q18-1 32.5-11t22.5-24q14-24 10-55h1l-1-459q-1-17-11-31.5t-24-23.5q-19-10-42-11zM918 367h2q12 0 20 5q6 3 8.5 6.5t2.5 9.5l1 456v3q2 16-5 29q-3 5-6.5 7.5t-9.5 2.5l-840 1h-3q-16 2-28-5q-6-3-8.5-6.5t-2.5-9.5v-458l-1-4q-2-14 5.5-25t18.5-11h837zM145 464v327h96v-188l96 120l96-120v188h96v-327h-96l-96 120l-96-120h-96zM697 464v168h-96l144 159l144-159h-96v-168h-96z"/></svg>' },
  { key: 'swagger-api-docs', name: 'Swagger / OpenAPI', description: 'Render API documentation', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><circle cx="128" cy="128" r="128" fill="#49A32B"/><path d="M169.33,127.96C169.04,133.25,164.42,137.64,159.87,136.87C154.75,136.88,150.66,132.79,150.65,127.75C150.82,122.69,155.02,118.7,160.08,118.79C165.13,118.81,169.6,123.08,169.33,127.96Z" fill="#fff"/><path d="M97.04,118.79C102.21,118.87,106.21,123,106.13,128.02C105.83,133.41,101.63,137.15,96.73,136.87C91.15,136.61,87.31,132.36,87.55,127.37C87.8,122.39,92.05,118.54,97.04,118.79Z" fill="#fff"/><path d="M128.27,118.79C133.76,118.75,137.4,122.3,137.43,127.72C137.46,133.28,134,136.85,128.56,136.87C123.02,136.89,119.37,133.39,119.34,128C119.48,122.39,123.49,118.64,128.27,118.79Z" fill="#fff"/></svg>' },
  { key: 'drawio-diagram', name: 'Draw.io Diagram', description: 'Create and edit diagrams with Draw.io', defaultEnabled: false, icon: '<svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="28" height="28" rx="1.12" style="fill:#f08705"/><path d="M25.24,17.96H21.946l-3.071-5.32h.2a1.119,1.119,0,0,0,1.12-1.12V6.76a1.119,1.119,0,0,0-1.12-1.12H12.92A1.119,1.119,0,0,0,11.8,6.76v4.76a1.119,1.119,0,0,0,1.12,1.12h.205l-3.071,5.32H6.76a1.119,1.119,0,0,0-1.12,1.12v4.76a1.119,1.119,0,0,0,1.12,1.12h6.16a1.119,1.119,0,0,0,1.12-1.12V19.08a1.119,1.119,0,0,0-1.12-1.12h-.927l3.072-5.32h1.87l3.071,5.32H19.08a1.119,1.119,0,0,0-1.12,1.12v4.76a1.119,1.119,0,0,0,1.12,1.12h6.16a1.119,1.119,0,0,0,1.12-1.12V19.08A1.119,1.119,0,0,0,25.24,17.96Z" style="fill:#fff"/></svg>', warning: 'Uses external service (embed.diagrams.net). Diagram data is sent externally.' },
  { key: 'poll-vote', name: 'Poll / Vote', description: 'Create polls and collect votes', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="3" fill="#34495E"/><rect x="5" y="13" width="4" height="6" rx="1" fill="#82D9C8"/><rect x="10" y="9" width="4" height="10" rx="1" fill="#ECF0F1"/><rect x="15" y="5" width="4" height="14" rx="1" fill="#F29C1F"/></svg>' },
  { key: 'mood-macro', name: 'Mood', description: 'Visualize team mood with floating bubbles', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4F5D73"/><circle cx="8" cy="10" r="2" fill="#C75C5C"/><circle cx="16" cy="10" r="2" fill="#C75C5C"/><circle cx="12" cy="8" r="2" fill="#C75C5C"/><path d="M12,22 L12,14" stroke="#76C2AF" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="10" r="1.5" fill="#F5CF87"/></svg>' },
  { key: 'graph-chart', name: 'Graph / Chart', description: 'Render interactive charts and graphs', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3,21 L3,3" stroke="#556080" stroke-width="2" stroke-linecap="round"/><path d="M3,21 L21,21" stroke="#556080" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="16" r="2.5" fill="#F29C1F"/><circle cx="12" cy="11" r="2.5" fill="#71C285"/><circle cx="17" cy="7" r="2.5" fill="#9777A8"/></svg>' },
  { key: 'typewriter-macro', name: 'Typewriter', description: 'Animate text with typewriter effects', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="16" height="10" rx="1" fill="#E6E6E6"/><rect x="3" y="12" width="18" height="8" rx="1" fill="#71C3A9"/><rect x="6" y="6" width="10" height="1.5" fill="#6C797A"/><rect x="6" y="8.5" width="6" height="1.5" fill="#6C797A"/></svg>' },
  { key: 'plantuml-macro', name: 'PlantUML', description: 'Render UML diagrams from PlantUML syntax', defaultEnabled: false, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3D3D3D"/><path d="M12,5 L12,12 L17,9" stroke="#EA2D2E" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="14" width="5" height="5" rx="1" fill="#fff"/><rect x="13" y="14" width="5" height="5" rx="1" fill="#fff"/></svg>', warning: 'Uses external service (plantuml.com). Source code is sent externally during editing.' },
  { key: 'excalidraw-wireframe', name: 'Wireframe / Whiteboard', description: 'Create wireframes and sketches', defaultEnabled: false, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="2" fill="#FFB739"/><path d="M6,18 L18,6" stroke="#233145" stroke-width="2" stroke-linecap="round"/><path d="M18,4 L20,6 L18,8" stroke="#466289" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', warning: 'Shape library downloads from libraries.excalidraw.com.' },
  { key: 'sticky-note', name: 'Sticky Note', description: 'Colorful sticky notes with handwritten style', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" fill="#FFEB3B"/><path d="M15,3 L15,9 L21,9" fill="#FBC02D"/><path d="M15,3 L21,9 L21,3 Z" fill="#F9A825"/></svg>' },
  { key: 'spoiler-reveal', name: 'Spoiler / Reveal', description: 'Hide content with animated reveal on click', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="3" fill="#607D8B"/><circle cx="12" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2"/><path d="M12,8 L12,4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><rect x="10" y="10" width="4" height="4" rx="1" fill="#fff"/></svg>' },
  { key: 'clock-gadget', name: 'Clock', description: 'Display configurable clock gadgets (analog/digital)', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#0052CC" stroke-width="2"/><line x1="12" y1="12" x2="12" y2="6" stroke="#172B4D" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="12" x2="16" y2="12" stroke="#172B4D" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="#0052CC"/></svg>' },
  { key: 'carousel-slideshow', name: 'Carousel / Slideshow', description: 'Display images in an interactive slideshow', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M1 2.5A1.5 1.5 0 012.5 1h15A1.5 1.5 0 0119 2.5v12a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 011 14.5v-12zM9 5a2 2 0 11-4 0 2 2 0 014 0zm6.57 9H4.427c-.351 0-.548-.368-.343-.632l3.046-3.24a.448.448 0 01.617-.009L9.143 11.6l2.623-3.825a.446.446 0 01.72.016l3.462 5.609c.154.272-.052.6-.377.6z" fill="#5C5F62"/><path d="M6 20a1 1 0 100-2 1 1 0 000 2zM11 19a1 1 0 11-2 0 1 1 0 012 0zM14 20a1 1 0 100-2 1 1 0 000 2z" fill="#5C5F62"/></svg>' },
];

export default function App() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [libCount, setLibCount] = useState(0);
  const [libSaved, setLibSaved] = useState(false);
  const [browseLib, setBrowseLib] = useState(false);
  const [libCatalog, setLibCatalog] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [addingLib, setAddingLib] = useState(null);
  const [addedLibs, setAddedLibs] = useState(new Set());

  useEffect(() => {
    invoke('getSettings').then((result) => {
      const s = {};
      MACROS.forEach((m) => { s[m.key] = result[m.key] !== undefined ? result[m.key] : m.defaultEnabled; });
      setSettings(s);
    });
    invoke('getSharedLibrary').then((r) => setLibCount(r.libraryItems?.length || 0));
  }, []);

  useEffect(() => {
    if (browseLib && !libCatalog) {
      fetch('https://libraries.excalidraw.com/libraries.json').then((r) => r.json()).then(setLibCatalog).catch(console.error);
    }
  }, [browseLib]);

  const addFromCatalog = async (lib) => {
    setAddingLib(lib.id);
    try {
      const res = await fetch(`https://libraries.excalidraw.com/libraries/${lib.source}`);
      const data = await res.json();
      const items = (data.library || data.libraryItems || []).map((item) =>
        Array.isArray(item) ? { status: 'published', elements: item } : { status: 'published', ...item }
      );
      const existing = await invoke('getSharedLibrary');
      const merged = [...(existing.libraryItems || []), ...items];
      await invoke('saveSharedLibrary', { libraryItems: merged });
      setLibCount(merged.length);
      setLibSaved(true);
      setAddedLibs((prev) => new Set([...prev, lib.id]));
    } catch (e) { console.error('Failed to add library', e); }
    setAddingLib(null);
  };

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
                <span style={{ flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: macro.icon }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-text, #172B4D)' }}>{macro.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)', marginTop: 1 }}>{macro.description}</div>
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
            {macro.key === 'excalidraw-wireframe' && (
              <div style={{ marginTop: 10, padding: 10, background: 'var(--ds-surface-sunken, #F7F8F9)', borderRadius: 4, opacity: settings['excalidraw-wireframe'] ? 1 : 0.4, pointerEvents: settings['excalidraw-wireframe'] ? 'auto' : 'none' }}>
                <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--ds-text, #172B4D)', marginBottom: 6 }}>Shared Shape Library</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ padding: '3px 8px', fontSize: 11, border: '1px solid var(--ds-border-brand, #0052CC)', borderRadius: 3, background: 'var(--ds-surface, #fff)', color: 'var(--ds-link, #0C66E4)', cursor: 'pointer' }}>
                    📁 Upload
                    <input type="file" accept=".excalidrawlib,.json" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      try {
                        const data = JSON.parse(await file.text());
                        const items = (data.library || data.libraryItems || []).map((item) => Array.isArray(item) ? { status: 'published', elements: item } : { status: 'published', ...item });
                        await invoke('saveSharedLibrary', { libraryItems: items });
                        setLibCount(items.length); setLibSaved(true);
                      } catch (err) { alert('Invalid file: ' + err.message); }
                    }} />
                  </label>
                  <button onClick={() => setBrowseLib(true)} style={{ padding: '3px 8px', fontSize: 11, border: '1px solid var(--ds-border-brand, #0052CC)', borderRadius: 3, background: 'var(--ds-surface, #fff)', color: 'var(--ds-link, #0C66E4)', cursor: 'pointer' }}>📚 Browse</button>
                  {libCount > 0 && <button onClick={async () => { await invoke('saveSharedLibrary', { libraryItems: [] }); setLibCount(0); setLibSaved(true); }} style={{ padding: '3px 8px', fontSize: 11, border: '1px solid var(--ds-border-danger, #de350b)', borderRadius: 3, background: 'var(--ds-surface, #fff)', color: '#de350b', cursor: 'pointer' }}>🗑 Clear</button>}
                  {libSaved && <span style={{ fontSize: 11, color: 'var(--ds-text-success, #216E4E)' }}>✓ Saved ({libCount})</span>}
                  {!libSaved && libCount > 0 && <span style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)' }}>{libCount} items</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Browse library modal */}
      {browseLib && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--ds-surface-overlay, #fff)', borderRadius: 8, width: 460, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ds-border, #091E4224)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-text, #172B4D)' }}>Community Libraries</span>
              <button onClick={() => setBrowseLib(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ds-text, #172B4D)' }}>✕</button>
            </div>
            <div style={{ padding: '8px 16px' }}>
              <input value={libSearch} onChange={(e) => setLibSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--ds-border, #091E4224)', borderRadius: 4, fontSize: 12, background: 'var(--ds-surface, #fff)', color: 'var(--ds-text, #172B4D)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
              {!libCatalog && <div style={{ padding: 16, textAlign: 'center', color: 'var(--ds-text-subtlest, #626F86)' }}>Loading...</div>}
              {(libCatalog || []).filter((l) => l.name.toLowerCase().includes(libSearch.toLowerCase()) || l.description?.toLowerCase().includes(libSearch.toLowerCase())).map((lib) => (
                <div key={lib.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--ds-border, #091E4224)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--ds-text, #172B4D)' }}>{lib.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lib.description}</div>
                  </div>
                  <button onClick={() => addFromCatalog(lib)} disabled={addingLib === lib.id} style={{ padding: '3px 8px', fontSize: 11, border: `1px solid ${addedLibs.has(lib.id) ? 'var(--ds-border-success, #36B37E)' : 'var(--ds-border-brand, #0052CC)'}`, borderRadius: 3, background: 'var(--ds-surface, #fff)', color: addedLibs.has(lib.id) ? 'var(--ds-text-success, #216E4E)' : 'var(--ds-link, #0C66E4)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {addingLib === lib.id ? '...' : addedLibs.has(lib.id) ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
