import React, { useState, useEffect, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

const SAMPLE = `@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi there
@enduml`;

function encodePlantUml(text) {
  // PlantUML uses a custom encoding: deflate + base64 variant
  // For the server URL, we use the hex encoding approach which is simpler
  return encodeURIComponent(text);
}

export default function App() {
  const [code, setCode] = useState(SAMPLE);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.code) setCode(c.code);
      if (c.svg) setPreview(c.svg);
    });
  }, []);

  // Debounced preview
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (code.trim()) fetchPreview(code);
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [code]);

  const fetchPreview = async (text) => {
    try {
      setError('');
      const result = await invoke('renderPlantUml', { code: text });
      if (result.svg) setPreview(result.svg);
      else if (result.error) setError(result.error);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Ensure we have latest SVG
    const result = await invoke('renderPlantUml', { code });
    const svg = result.svg || preview;
    view.submit({ config: { code, svg } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, borderRight: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>PlantUML</h3>
          <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: 14, padding: 8, resize: 'none', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {error && <p style={{ color: 'red', fontSize: 12, margin: '4px 0 0' }}>{error}</p>}
        <button onClick={handleSave} disabled={saving} style={{ marginTop: 12, padding: '8px 16px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {preview ? <div dangerouslySetInnerHTML={{ __html: preview }} style={{ maxWidth: '100%' }} /> : <p style={{ color: '#6b778c' }}>Preview will appear here...</p>}
      </div>
    </div>
  );
}
