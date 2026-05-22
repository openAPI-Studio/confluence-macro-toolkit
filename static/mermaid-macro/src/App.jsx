import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';
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
  const [code, setCode] = useState('');
  const [disabled, setDisabled] = useState(false);
  const containerRef = useRef(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['mermaid-diagram'] === false) setDisabled(true); });
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      setCode(config.code || '');
    });
  }, []);

  useEffect(() => {
    if (!code || !containerRef.current) return;
    renderIdRef.current += 1;
    const id = `mermaid-svg-${renderIdRef.current}`;
    containerRef.current.innerHTML = '';
    mermaid.render(id, code).then(({ svg }) => {
      containerRef.current.innerHTML = svg;
    }).catch(() => {
      containerRef.current.innerHTML = '<pre style="color:red">Invalid Mermaid syntax</pre>';
    });
  }, [code]);

  if (disabled) return <p style={{ color: '#6b778c' }}>This macro has been disabled by your site administrator.</p>;
  if (!code) return <p style={{ color: '#6b778c' }}>No diagram configured. Edit this macro to add Mermaid code.</p>;

  return <div ref={containerRef} />;
}
