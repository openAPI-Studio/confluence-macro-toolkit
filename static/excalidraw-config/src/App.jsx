import React, { useEffect, useRef, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import { Excalidraw, exportToSvg } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

window.EXCALIDRAW_ASSET_PATH = './';

const LIBRARIES_URL = 'https://libraries.excalidraw.com';

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [search, setSearch] = useState('');
  const [loadingLib, setLoadingLib] = useState(null);
  const excalidrawAPI = useRef(null);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      if (config.elements) {
        try {
          setInitialData({
            elements: JSON.parse(config.elements),
            appState: config.appState ? JSON.parse(config.appState) : { viewBackgroundColor: '#ffffff' },
          });
        } catch { setInitialData(null); }
      }
      setLoaded(true);
    });
  }, []);

  // Hijack the "Browse libraries" link click
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest('.library-menu-browse-button');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        openLibrary();
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  // Load shared library from admin settings
  const loadSharedLibrary = async (api) => {
    try {
      const { libraryItems } = await invoke('getSharedLibrary');
      if (libraryItems?.length) {
        await api.updateLibrary({ libraryItems, merge: true, openLibraryMenu: false, defaultStatus: 'published' });
      }
    } catch (e) { console.error('Failed to load shared library', e); }
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    if (!catalog) {
      try {
        const res = await fetch(`${LIBRARIES_URL}/libraries.json`);
        setCatalog(await res.json());
      } catch (e) { console.error('Failed to fetch library catalog', e); }
    }
  };

  const addLibrary = async (lib) => {
    const api = excalidrawAPI.current;
    if (!api) return;
    setLoadingLib(lib.id);
    try {
      const res = await fetch(`${LIBRARIES_URL}/libraries/${lib.source}`);
      const data = await res.json();
      const items = (data.library || data.libraryItems || []).map((item) =>
        Array.isArray(item) ? { status: 'published', elements: item } : { status: 'published', ...item }
      );
      await api.updateLibrary({ libraryItems: items, merge: true, openLibraryMenu: true });
    } catch (e) { console.error('Failed to load library', e); }
    setLoadingLib(null);
  };

  const handleSave = async () => {
    const api = excalidrawAPI.current;
    if (!api) return;
    setSaving(true);
    try {
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();
      const svg = await exportToSvg({ elements, appState, files });
      const svgStr = new XMLSerializer().serializeToString(svg);
      view.submit({
        config: {
          elements: JSON.stringify(elements),
          appState: JSON.stringify({ viewBackgroundColor: appState.viewBackgroundColor }),
          svg: svgStr,
        },
      });
    } catch (e) {
      console.error('Save error:', e);
      setSaving(false);
    }
  };

  const filtered = catalog?.filter((lib) =>
    lib.name.toLowerCase().includes(search.toLowerCase()) ||
    lib.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (!loaded) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Wireframe Editor</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => view.close()} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '6px 14px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {showLibrary && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 320, height: 'calc(100% - 44px)', background: '#fff', borderLeft: '1px solid #ddd', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 8px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>Browse Libraries</span>
            <button onClick={() => setShowLibrary(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search libraries..." style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
            {!catalog && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Loading catalog...</div>}
            {filtered.map((lib) => (
              <div key={lib.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{lib.name}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{lib.description}</div>
                <button onClick={() => addLibrary(lib)} disabled={loadingLib === lib.id} style={{ marginTop: 6, padding: '3px 8px', fontSize: 11, border: '1px solid #0052CC', borderRadius: 3, background: loadingLib === lib.id ? '#eee' : '#fff', color: '#0052CC', cursor: 'pointer' }}>
                  {loadingLib === lib.id ? 'Adding...' : '+ Add to Library'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Excalidraw
          excalidrawAPI={(api) => { excalidrawAPI.current = api; loadSharedLibrary(api); }}
          initialData={initialData}
          UIOptions={{ canvasActions: { saveAsImage: false, export: false, loadScene: false }, tools: { image: false }, welcomeScreen: false }}
        />
      </div>
    </div>
  );
}
