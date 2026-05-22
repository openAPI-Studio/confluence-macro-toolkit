import React, { useState, useEffect, useRef } from 'react';
import { view } from '@forge/bridge';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e8f4fd',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#4a90d9',
    lineColor: '#4a90d9',
    secondaryColor: '#f0f0f0',
    tertiaryColor: '#fff',
    background: '#ffffff',
    mainBkg: '#e8f4fd',
    nodeBorder: '#4a90d9',
    clusterBkg: '#f9f9f9',
    titleColor: '#1a1a1a',
    edgeLabelBackground: '#ffffff',
  },
});

export default function App() {
  const [code, setCode] = useState('graph TD\n  A[Start] --> B[End]');
  const previewRef = useRef(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      if (config.code) setCode(config.code);
    });
  }, []);

  useEffect(() => {
    if (!previewRef.current || !code.trim()) return;
    renderIdRef.current += 1;
    const id = `preview-svg-${renderIdRef.current}`;
    previewRef.current.innerHTML = '';
    mermaid.render(id, code).then(({ svg }) => {
      previewRef.current.innerHTML = svg;
    }).catch((err) => {
      previewRef.current.innerHTML = `<pre style="color:red">${err.message || 'Invalid syntax'}</pre>`;
    });
  }, [code]);

  const handleSubmit = () => {
    view.submit({ config: { code } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, borderRight: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 8px' }}>Mermaid Code</h3>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: 14, padding: 8, resize: 'none', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button onClick={handleSubmit} style={{ marginTop: 12, padding: '8px 16px', background: '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>
          Save
        </button>
      </div>
      <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 8px' }}>Preview</h3>
        <div ref={previewRef} />
      </div>
    </div>
  );
}
