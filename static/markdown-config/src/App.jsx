import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function App() {
  const [code, setCode] = useState('# Hello\n\nWrite your **Markdown** here.');

  useEffect(() => {
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      if (config.code) setCode(config.code);
    });
  }, []);

  const handleSubmit = () => {
    view.submit({ config: { code } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, borderRight: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 8px' }}>Markdown</h3>
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
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{code}</ReactMarkdown>
      </div>
    </div>
  );
}
