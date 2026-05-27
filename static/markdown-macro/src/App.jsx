import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

let renderCount = 0;

const btnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
  borderRadius: 3, color: '#6b778c', fontSize: 14, lineHeight: 1,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

function MermaidBlock({ code }) {
  const ref = useRef(null);
  const svgRef = useRef('');
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    renderCount += 1;
    const id = `mermaid-md-${renderCount}`;
    mermaid.render(id, code).then(({ svg }) => {
      svgRef.current = svg;
      ref.current.innerHTML = svg;
    }).catch(() => {
      svgRef.current = '';
      ref.current.innerHTML = '<pre style="color:red">Invalid Mermaid syntax</pre>';
    });
  }, [code]);

  const downloadPng = () => {
    if (!svgRef.current) return;
    const svg = ref.current.querySelector('svg');
    if (!svg) return;
    const svgClone = svg.cloneNode(true);
    const { width, height } = svg.getBoundingClientRect();
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = 'diagram.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', margin: '8px 0', maxHeight: 500, overflow: 'auto', border: '1px solid #eee', borderRadius: 4 }}
    >
      <div
        style={{
          position: 'sticky', top: 4, float: 'right', marginRight: 4, display: 'flex', gap: 2,
          background: 'rgba(255,255,255,0.95)', borderRadius: 4, padding: '2px 4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s', zIndex: 1,
        }}
      >
        <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} style={btnStyle} title="Zoom in">+</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} style={btnStyle} title="Zoom out">−</button>
        <button onClick={() => setZoom(1)} style={{ ...btnStyle, fontSize: 11 }} title="Reset zoom">1:1</button>
        <button onClick={downloadPng} style={btnStyle} title="Download PNG">⤓</button>
      </div>
      <div ref={ref} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, transition: 'transform 0.2s' }} />
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [mermaidEnabled, setMermaidEnabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => {
      if (s['markdown-renderer'] === false) setDisabled(true);
      if (s['mermaid-diagram'] !== false) setMermaidEnabled(true);
    });
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      setCode(config.code || '');
    });
  }, []);

  const components = mermaidEnabled ? {
    code({ className, children }) {
      const lang = className?.replace('language-', '');
      if (lang === 'mermaid') return <MermaidBlock code={String(children).trim()} />;
      return <code className={className}>{children}</code>;
    }
  } : undefined;

  if (disabled) return <p style={{ color: '#6b778c' }}>This macro has been disabled by your site administrator.</p>;
  if (!code) return <p style={{ color: '#6b778c' }}>No content configured. Edit this macro to add Markdown.</p>;

  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{code}</ReactMarkdown>;
}
