import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [state, setState] = useState('loading');
  const [svg, setSvg] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['plantuml-macro'] === false) setState('disabled'); });
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      console.log('plantuml config keys:', Object.keys(c), 'svg length:', c.svg?.length);
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
      if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto'; }
    }
  }, [state, svg]);

  if (state === 'loading') return <div style={{ padding: 16 }}>Loading...</div>;
  if (state === 'disabled') return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (state === 'empty') return <p style={{ color: '#6b778c', padding: 16 }}>No diagram configured. Edit this macro to add PlantUML code.</p>;

  return <div ref={containerRef} style={{ padding: 16, width: '100%' }} />;
}
