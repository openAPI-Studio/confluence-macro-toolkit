import React, { useEffect, useRef, useState } from 'react';
import { invoke, view } from '@forge/bridge';

export default function App() {
  const [status, setStatus] = useState('Loading...');
  const xmlRef = useRef('');
  const iframeRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    view.getContext().then(async (ctx) => {
      ctxRef.current = ctx;
      const config = ctx.extension.config || {};
      if (config.storageKey) {
        try {
          const result = await invoke('loadDiagram', { storageKey: config.storageKey });
          if (result.xml) xmlRef.current = result.xml;
        } catch (e) {
          console.error('Failed to load diagram', e);
        }
      }
      setStatus('ready');
    });
  }, []);

  useEffect(() => {
    const handler = (evt) => {
      if (!evt.data || typeof evt.data !== 'string') return;
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }
      if (!msg.event) return;

      if (msg.event === 'init') {
        iframeRef.current?.contentWindow.postMessage(
          JSON.stringify({ action: 'load', xml: xmlRef.current || '' }),
          '*'
        );
      } else if (msg.event === 'save') {
        xmlRef.current = msg.xml;
        iframeRef.current?.contentWindow.postMessage(
          JSON.stringify({ action: 'export', format: 'svg' }),
          '*'
        );
      } else if (msg.event === 'export') {
        let svgData = msg.data;
        if (svgData.startsWith('data:image/svg+xml;base64,')) {
          svgData = atob(svgData.replace('data:image/svg+xml;base64,', ''));
        }
        handleSave(xmlRef.current, svgData);
      } else if (msg.event === 'exit') {
        view.close();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSave = async (diagramXml, svg) => {
    setStatus('Saving...');
    try {
      const ctx = ctxRef.current;
      const contentId = ctx.extension.content.id;
      const localId = ctx.extension.macro?.id || ctx.localId || Date.now().toString();

      const result = await invoke('saveDiagram', {
        contentId,
        xml: diagramXml,
        svg,
        macroId: localId,
      });

      view.submit({
        config: {
          storageKey: result.storageKey,
          attachmentId: result.attachmentId,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.error('Save failed', e);
      setStatus('Error: ' + e.message);
    }
  };

  if (status !== 'ready') {
    return <div style={{ padding: 20, textAlign: 'center' }}>{status}</div>;
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        ref={iframeRef}
        src="https://embed.diagrams.net/?embed=1&proto=json&spin=1&saveAndExit=1&noExitBtn=0"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
