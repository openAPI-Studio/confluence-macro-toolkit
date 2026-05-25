import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [state, setState] = useState('loading');
  const [svg, setSvg] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['excalidraw-wireframe'] === false) setState('disabled'); });
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.svg) {
        setSvg(c.svg);
        setState('ready');
      } else {
        setState('empty');
      }
    });
  }, []);

  useEffect(() => {
    if (state === 'ready' && svg && containerRef.current) {
      containerRef.current.innerHTML = svg;
      const svgEl = containerRef.current.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.style.width = '100%';
        svgEl.style.maxWidth = '100%';
      }
    }
  }, [state, svg]);

  if (state === 'loading') return <div style={{ padding: 16 }}>Loading...</div>;
  if (state === 'disabled') return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (state === 'empty') return <p style={{ color: '#6b778c', padding: 16 }}>No wireframe configured. Edit this macro to create one.</p>;

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
