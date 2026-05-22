import React, { useEffect, useState, useRef } from 'react';
import { invoke, view } from '@forge/bridge';

export default function App() {
  const [state, setState] = useState('loading');
  const [disabled, setDisabled] = useState(false);
  const [xml, setXml] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => {
      if (s['drawio-diagram'] === false) { setDisabled(true); setState('disabled'); return; }
    });
    view.getContext().then(async (ctx) => {
      const config = ctx.extension.config || {};
      if (!config.storageKey) { setState('empty'); return; }

      try {
        const result = await invoke('loadDiagram', { storageKey: config.storageKey });
        if (!result.xml) { setState('empty'); return; }
        setXml(result.xml);
        setState('ready');
      } catch {
        setState('error');
      }
    });
  }, []);

  useEffect(() => {
    if (state !== 'ready' || !xml) return;

    const handler = (evt) => {
      if (!evt.data || typeof evt.data !== 'string') return;
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }

      // Viewer sends 'init' when ready — load the diagram in view-only mode
      if (msg.event === 'init') {
        iframeRef.current?.contentWindow.postMessage(
          JSON.stringify({ action: 'load', xml, autosave: 0 }),
          '*'
        );
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [state, xml]);

  if (state === 'loading') return <p style={{ color: '#6b778c' }}>Loading diagram...</p>;
  if (state === 'disabled' || disabled) return <p style={{ color: '#6b778c' }}>This macro has been disabled by your site administrator.</p>;
  if (state === 'empty') return <p style={{ color: '#6b778c' }}>No diagram configured. Edit this macro to create a Draw.io diagram.</p>;
  if (state === 'error') return <p style={{ color: 'red' }}>Failed to load diagram.</p>;

  return (
    <div style={{ width: '100%' }}>
      <iframe
        ref={iframeRef}
        src="https://embed.diagrams.net/?embed=1&proto=json&spin=1&lightbox=1&nav=1&layers=1"
        style={{ width: '100%', minHeight: 500, border: 'none' }}
      />
    </div>
  );
}
