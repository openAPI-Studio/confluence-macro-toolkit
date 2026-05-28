import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

const TRANSITIONS = ['slide', 'fade', 'zoom', 'flip'];
const CONTROLS = ['arrows', 'dots', 'both', 'none'];
const AUTOPLAY = [{ label: 'Off', value: 0 }, { label: '2s', value: 2000 }, { label: '3s', value: 3000 }, { label: '5s', value: 5000 }, { label: '8s', value: 8000 }];

export default function App() {
  const [tab, setTab] = useState('pages');
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [browsePage, setBrowsePage] = useState(null);
  const [browseImages, setBrowseImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selected, setSelected] = useState([]);
  const [transition, setTransition] = useState('slide');
  const [controls, setControls] = useState('both');
  const [autoplay, setAutoplay] = useState(0);
  const [loop, setLoop] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContentId(ctx.extension.content?.id || '');
      const c = ctx.extension.config || {};
      if (c.transition) setTransition(c.transition);
      if (c.controls) setControls(c.controls);
      if (c.autoplay) setAutoplay(Number(c.autoplay));
      if (c.loop !== undefined) setLoop(c.loop === 'true' || c.loop === true);
      if (c.images) {
        try { setSelected(JSON.parse(c.images)); } catch {}
      }
    });
  }, []);

  const searchPages = (q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setPages([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { pages: results } = await invoke('searchPages', { query: q });
      setPages(results || []);
      setSearching(false);
    }, 400);
  };

  const loadPageImages = async (page) => {
    setBrowsePage(page);
    setLoadingImages(true);
    const { images } = await invoke('getPageAttachments', { pageId: page.id });
    setBrowseImages(images || []);
    setLoadingImages(false);
  };

  const toggleImage = (img) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === img.id && s.sourcePageId === img.sourcePageId);
      if (exists) return prev.filter((s) => !(s.id === img.id && s.sourcePageId === img.sourcePageId));
      return [...prev, img];
    });
  };

  const isSelected = (img) => selected.some((s) => s.id === img.id && s.sourcePageId === img.sourcePageId);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
      const { id, url } = await invoke('uploadImage', { contentId, filename: file.name, dataUrl });
      if (id) setSelected((prev) => [...prev, { id, name: file.name, url, sourcePageId: contentId, local: true }]);
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    // Copy remote images to current page
    const finalImages = [];
    for (const img of selected) {
      if (img.local || img.sourcePageId === contentId) {
        finalImages.push({ id: img.id, name: img.name });
      } else {
        const result = await invoke('copyAttachmentToPage', { sourcePageId: img.sourcePageId, attachmentId: img.id, targetPageId: contentId });
        if (result.id) finalImages.push({ id: result.id, name: result.name });
      }
    }
    view.submit({ config: { images: JSON.stringify(finalImages), transition, controls, autoplay: String(autoplay), loop: String(loop) } });
  };

  const Pill = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', border: active ? '2px solid var(--ds-border-brand, #0052CC)' : '1px solid var(--ds-border, #ddd)', borderRadius: 4, background: active ? 'var(--ds-background-selected, #E9F2FF)' : 'var(--ds-surface, #fff)', color: 'var(--ds-text, #172B4D)', cursor: 'pointer', fontSize: 11, textTransform: 'capitalize' }}>{children}</button>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', color: 'var(--ds-text, #172B4D)' }}>
      {/* Left panel - image selection */}
      <div style={{ width: 360, borderRight: '1px solid var(--ds-border, #ddd)', display: 'flex', flexDirection: 'column', background: 'var(--ds-surface-sunken, #f9f9f9)' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ds-border, #ddd)' }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
            {['pages', 'upload'].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '6px 0', border: 'none', borderBottom: tab === t ? '2px solid var(--ds-border-brand, #0052CC)' : '2px solid transparent', background: 'none', color: tab === t ? 'var(--ds-link, #0052CC)' : 'var(--ds-text-subtlest, #626F86)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{t === 'pages' ? '🔍 From Pages' : '📁 Upload'}</button>
            ))}
          </div>
          {tab === 'pages' && (
            <input value={query} onChange={(e) => searchPages(e.target.value)} placeholder="Search pages by title..." style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--ds-border, #ddd)', borderRadius: 4, fontSize: 12, boxSizing: 'border-box', background: 'var(--ds-surface, #fff)', color: 'var(--ds-text, #172B4D)' }} />
          )}
          {tab === 'upload' && (
            <label style={{ display: 'block', padding: '16px', border: '2px dashed var(--ds-border, #ddd)', borderRadius: 6, textAlign: 'center', cursor: 'pointer', fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)' }}>
              📎 Click or drag images here
              <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          {tab === 'pages' && !browsePage && (
            <>
              {searching && <div style={{ padding: 12, fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)' }}>Searching...</div>}
              {pages.map((p) => (
                <div key={p.id} onClick={() => loadPageImages(p)} style={{ padding: '8px 10px', borderRadius: 4, cursor: 'pointer', marginBottom: 4, background: 'var(--ds-surface, #fff)', border: '1px solid var(--ds-border, #eee)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                  {p.space && <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)' }}>{p.space}</div>}
                </div>
              ))}
            </>
          )}
          {tab === 'pages' && browsePage && (
            <>
              <button onClick={() => { setBrowsePage(null); setBrowseImages([]); }} style={{ padding: '4px 8px', fontSize: 11, border: '1px solid var(--ds-border, #ddd)', borderRadius: 4, background: 'var(--ds-surface, #fff)', cursor: 'pointer', marginBottom: 8, color: 'var(--ds-text, #172B4D)' }}>← Back</button>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{browsePage.title}</div>
              {loadingImages && <div style={{ fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)' }}>Loading images...</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {browseImages.map((img) => (
                  <div key={img.id} onClick={() => toggleImage(img)} style={{ position: 'relative', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', border: isSelected(img) ? '3px solid var(--ds-border-brand, #0052CC)' : '1px solid var(--ds-border, #ddd)', cursor: 'pointer' }}>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSelected(img) && <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'var(--ds-background-brand-bold, #0052CC)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                  </div>
                ))}
                {!loadingImages && browseImages.length === 0 && <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--ds-text-subtlest, #626F86)', padding: 12 }}>No images found on this page</div>}
              </div>
            </>
          )}
        </div>

        {/* Selected strip */}
        {selected.length > 0 && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--ds-border, #ddd)', background: 'var(--ds-surface, #fff)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--ds-text-subtlest, #626F86)' }}>Selected ({selected.length})</div>
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
              {selected.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 40, height: 40, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--ds-border, #ddd)' }}>
                  {img.url && <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div onClick={() => setSelected((p) => p.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: '#de350b', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel - settings + save */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--ds-text, #172B4D)' }}>Carousel Settings</h3>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-text-subtlest, #626F86)', marginBottom: 6 }}>Transition</div>
          <div style={{ display: 'flex', gap: 6 }}>{TRANSITIONS.map((t) => <Pill key={t} active={transition === t} onClick={() => setTransition(t)}>{t}</Pill>)}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-text-subtlest, #626F86)', marginBottom: 6 }}>Controls</div>
          <div style={{ display: 'flex', gap: 6 }}>{CONTROLS.map((c) => <Pill key={c} active={controls === c} onClick={() => setControls(c)}>{c}</Pill>)}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-text-subtlest, #626F86)', marginBottom: 6 }}>Auto-play</div>
          <div style={{ display: 'flex', gap: 6 }}>{AUTOPLAY.map((a) => <Pill key={a.value} active={autoplay === a.value} onClick={() => setAutoplay(a.value)}>{a.label}</Pill>)}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-text-subtlest, #626F86)', marginBottom: 6 }}>Loop</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Pill active={loop} onClick={() => setLoop(true)}>On</Pill>
            <Pill active={!loop} onClick={() => setLoop(false)}>Off</Pill>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => view.close()} style={{ padding: '8px 16px', border: '1px solid var(--ds-border, #ddd)', borderRadius: 4, background: 'var(--ds-surface, #fff)', color: 'var(--ds-text, #172B4D)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || selected.length === 0} style={{ padding: '8px 16px', background: saving || selected.length === 0 ? 'var(--ds-background-neutral, #ccc)' : 'var(--ds-background-brand-bold, #0052CC)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>{saving ? 'Saving...' : `Save (${selected.length} images)`}</button>
        </div>
      </div>
    </div>
  );
}
