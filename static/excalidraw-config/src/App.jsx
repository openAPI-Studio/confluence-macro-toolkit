import React, { useEffect, useRef, useState, useCallback } from 'react';
import { view } from '@forge/bridge';
import { Excalidraw, exportToSvg } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

window.EXCALIDRAW_ASSET_PATH = './';

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    const api = excalidrawAPI.current;
    if (!api) { console.error('No excalidraw API ref'); return; }
    setSaving(true);

    try {
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();

      console.log('Saving, elements:', elements.length);
      const svg = await exportToSvg({ elements, appState, files });
      const svgStr = new XMLSerializer().serializeToString(svg);
      console.log('SVG length:', svgStr.length);

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
      <div style={{ flex: 1 }}>
        <Excalidraw
          excalidrawAPI={(api) => { excalidrawAPI.current = api; }}
          initialData={initialData}
          UIOptions={{ canvasActions: { saveAsImage: false, export: false, loadScene: false }, tools: { image: false } }}
        />
      </div>
    </div>
  );
}
