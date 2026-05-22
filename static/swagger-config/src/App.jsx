import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';

const SAMPLE = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Sample API', version: '1.0.0' },
  paths: { '/hello': { get: { summary: 'Say hello', responses: { '200': { description: 'OK' } } } } }
}, null, 2);

export default function App() {
  const [code, setCode] = useState(SAMPLE);
  const [error, setError] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      if (config.code) setCode(config.code);
    });
  }, []);

  useEffect(() => {
    try {
      JSON.parse(code);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [code]);

  const handleSubmit = () => {
    if (error) return;
    view.submit({ config: { code } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>OpenAPI / Swagger Spec (JSON)</h3>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, padding: 8, resize: 'none', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {error && <p style={{ color: 'red', margin: '8px 0 0', fontSize: 13 }}>Invalid JSON: {error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!!error}
          style={{ marginTop: 12, padding: '8px 16px', background: error ? '#ccc' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: error ? 'not-allowed' : 'pointer', fontSize: 14 }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
