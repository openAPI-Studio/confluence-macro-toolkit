import React, { useState, useEffect, useRef } from 'react';
import { view } from '@forge/bridge';
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
    const id = `mermaid-cfg-${renderCount}`;
    mermaid.render(id, code).then(({ svg }) => {
      svgRef.current = svg;
      ref.current.innerHTML = svg;
    }).catch(() => {
      svgRef.current = '';
      ref.current.innerHTML = '<pre style="color:red;font-size:12px">Invalid Mermaid syntax</pre>';
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

const components = {
  code({ className, children }) {
    const lang = className?.replace('language-', '');
    if (lang === 'mermaid') return <MermaidBlock code={String(children).trim()} />;
    return <code className={className}>{children}</code>;
  }
};

const INFO_CONTENT = `**Markdown Syntax**
| Syntax | Result |
|--------|--------|
| \`# Heading 1\` | Heading 1 |
| \`## Heading 2\` | Heading 2 |
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`~~strikethrough~~\` | ~~strikethrough~~ |
| \`[link](url)\` | Hyperlink |
| \`![alt](url)\` | Image |
| \`\\\`code\\\`\` | Inline code |
| \`> quote\` | Blockquote |
| \`- item\` | Unordered list |
| \`1. item\` | Ordered list |
| \`---\` | Horizontal rule |
| \`| a | b |\` | Table |

**Mermaid Diagrams**

Use fenced code blocks with \`mermaid\` language:

\\\`\\\`\\\`mermaid
graph TD
    A --> B
\\\`\\\`\\\`

Supported diagram types:
- \`graph\` / \`flowchart\` — Flow charts
- \`sequenceDiagram\` — Sequence diagrams
- \`classDiagram\` — Class diagrams
- \`stateDiagram-v2\` — State diagrams
- \`erDiagram\` — Entity relationship
- \`gantt\` — Gantt charts
- \`pie\` — Pie charts
- \`gitGraph\` — Git graphs
- \`mindmap\` — Mind maps
- \`timeline\` — Timelines
- \`quadrantChart\` — Quadrant charts
- \`xychart-beta\` — XY charts
- \`sankey-beta\` — Sankey diagrams
- \`architecture-beta\` — Architecture
- \`kanban\` — Kanban boards
- \`C4Context\` — C4 diagrams

*Mermaid rendering requires the Mermaid Diagram setting to be enabled by your admin.*`;

export default function App() {
  const [code, setCode] = useState('# Hello\n\nWrite your **Markdown** here.');
  const [showInfo, setShowInfo] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px' }}>
          <h3 style={{ margin: 0 }}>Markdown</h3>
          <span
            onClick={() => setShowInfo(!showInfo)}
            title="Syntax reference"
            style={{ width: 20, height: 20, borderRadius: '50%', background: '#0052CC', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
          >i</span>
        </div>
        {showInfo && (
          <div style={{ marginBottom: 8, padding: 12, background: '#f4f5f7', border: '1px solid #ddd', borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{INFO_CONTENT}</ReactMarkdown>
          </div>
        )}
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
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{code}</ReactMarkdown>
      </div>
    </div>
  );
}
