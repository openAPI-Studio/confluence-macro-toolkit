import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';

const COLORS = [
  { value: '#FFEB3B', label: 'Yellow' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#E91E63', label: 'Pink' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#FFFFFF', label: 'White' },
];

const SIZES = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'full', label: 'Full' },
];

const FONTS = [
  { value: 'handwritten', label: 'Handwritten' },
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
];

const ATTACHMENTS = [
  { value: 'tape', label: '📎 Tape' },
  { value: 'pin', label: '📌 Pin' },
  { value: 'none', label: '✕ None' },
];

const TAPE_COLORS = [
  { value: 'rgba(255,255,255,0.6)', label: 'White' },
  { value: 'rgba(255,235,59,0.5)', label: 'Yellow' },
  { value: 'rgba(76,175,80,0.4)', label: 'Green' },
  { value: 'rgba(33,150,243,0.4)', label: 'Blue' },
  { value: 'rgba(156,39,176,0.4)', label: 'Purple' },
];

const PIN_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -1028.4)"><g transform="matrix(.70711 .70711 -.70711 .70711 737.68 297.72)"><path d="m11 1028.4v13h1 6.406c-0.595-1.1-1.416-2.1-2.406-2.8v-8c0.616-0.6 1.131-1.4 1.531-2.2h-5.531-1z" fill="#c0392b"/><path d="m11 13v2 4 2l1 2v-2-6-2h-1z" transform="translate(0 1028.4)" fill="#bdc3c7"/><path d="m12 13v2 4 2 2l1-2v-2-4-2h-1z" transform="translate(0 1028.4)" fill="#7f8c8d"/><path d="m6.4688 1028.4c0.4006 0.8 0.915 1.6 1.5312 2.2v8c-0.9897 0.7-1.8113 1.7-2.4062 2.8h6.4062v-13h-5.5312z" fill="#e74c3c"/></g></g></svg>';

const Label = ({ children }) => <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#5e6c84', marginBottom: 6 }}>{children}</div>;
const Pill = ({ active, onClick, children, style = {} }) => (
  <button onClick={onClick} style={{ padding: '5px 12px', border: 'none', borderRadius: 20, background: active ? '#0052CC' : '#f0f1f4', color: active ? '#fff' : '#44546f', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.15s', ...style }}>{children}</button>
);

export default function App() {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FFEB3B');
  const [size, setSize] = useState('medium');
  const [font, setFont] = useState('handwritten');
  const [attach, setAttach] = useState('tape');
  const [tapeColor, setTapeColor] = useState('rgba(255,255,255,0.6)');
  const [textAlign, setTextAlign] = useState('left');
  const [vertAlign, setVertAlign] = useState('top');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.text) setText(c.text);
      if (c.color) setColor(c.color);
      if (c.size) setSize(c.size);
      if (c.font) setFont(c.font);
      if (c.attach) setAttach(c.attach);
      if (c.tapeColor) setTapeColor(c.tapeColor);
      if (c.textAlign) setTextAlign(c.textAlign);
      if (c.vertAlign) setVertAlign(c.vertAlign);
      if (c.lineSpacing) setLineSpacing(c.lineSpacing);
    });
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaving(true);
    view.submit({ config: { text, color, size, font, attach, tapeColor, textAlign, vertAlign, lineSpacing } });
  };

  const fontFamily = font === 'handwritten' ? '"Comic Sans MS", "Segoe Script", cursive' : font === 'serif' ? 'Georgia, serif' : font === 'mono' ? '"Courier New", monospace' : 'sans-serif';
  const noteWidth = size === 'small' ? 150 : size === 'large' ? 300 : size === 'full' ? '100%' : 220;
  const noteMinH = size === 'small' ? 80 : size === 'large' ? 160 : 120;
  const noteFontSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const noteLH = lineSpacing === 'tight' ? 1.2 : lineSpacing === 'loose' ? 2.2 : 1.6;
  const tapeW = size === 'small' ? 30 : size === 'large' ? 60 : 40;
  const tapeH = size === 'small' ? 10 : size === 'large' ? 16 : 12;
  const pinW = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const pinH = size === 'small' ? 18 : size === 'large' ? 32 : 24;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Left panel — controls */}
      <div style={{ width: 320, padding: '24px 20px', overflowY: 'auto', borderRight: '1px solid #e8e8e8', background: '#fafbfc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Sticky Note</h3>
          <button onClick={() => view.close()} style={{ width: 28, height: 28, border: 'none', borderRadius: 6, background: '#f0f1f4', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <Label>Note Color</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {COLORS.map((c) => (
            <button key={c.value} onClick={() => setColor(c.value)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: c.value, border: color === c.value ? '2.5px solid #333' : '2px solid #e0e0e0', cursor: 'pointer', transition: 'transform 0.1s', transform: color === c.value ? 'scale(1.15)' : 'scale(1)' }} title={c.label} />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer' }} title="Custom" />
        </div>

        <Label>Size</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {SIZES.map((s) => <Pill key={s.value} active={size === s.value} onClick={() => setSize(s.value)}>{s.label}</Pill>)}
        </div>

        <Label>Font</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {FONTS.map((f) => <Pill key={f.value} active={font === f.value} onClick={() => setFont(f.value)}>{f.label}</Pill>)}
        </div>

        <Label>Attachment</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {ATTACHMENTS.map((a) => <Pill key={a.value} active={attach === a.value} onClick={() => setAttach(a.value)}>{a.label}</Pill>)}
        </div>
        {attach === 'tape' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {TAPE_COLORS.map((tc) => (
              <button key={tc.value} onClick={() => setTapeColor(tc.value)} style={{ width: 32, height: 14, borderRadius: 3, background: tc.value, border: tapeColor === tc.value ? '2px solid #333' : '1px solid #ddd', cursor: 'pointer' }} title={tc.label} />
            ))}
          </div>
        )}

        <Label>Layout</Label>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['left', 'center', 'right'].map((a) => (
              <Pill key={a} active={textAlign === a} onClick={() => setTextAlign(a)} style={{ padding: '4px 8px', fontSize: 13 }}>{a === 'left' ? '⫷' : a === 'center' ? '≡' : '⫸'}</Pill>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['top', 'middle', 'bottom'].map((v) => (
              <Pill key={v} active={vertAlign === v} onClick={() => setVertAlign(v)} style={{ padding: '4px 8px', fontSize: 10 }}>{v[0].toUpperCase()}</Pill>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['tight', 'normal', 'loose'].map((s) => (
              <Pill key={s} active={lineSpacing === s} onClick={() => setLineSpacing(s)} style={{ padding: '4px 8px', fontSize: 10 }}>{s === 'tight' ? '≡' : s === 'loose' ? '☰' : '⊟'}</Pill>
            ))}
          </div>
        </div>

        <Label>Content</Label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your note..."
          style={{ width: '100%', minHeight: 100, padding: 12, fontSize: 14, border: '1px solid #dfe1e6', borderRadius: 8, boxSizing: 'border-box', fontFamily, resize: 'vertical', outline: 'none', transition: 'border 0.2s' }}
          onFocus={(e) => e.target.style.borderColor = '#0052CC'} onBlur={(e) => e.target.style.borderColor = '#dfe1e6'} />

        <button onClick={handleSave} disabled={saving || !text.trim()} style={{ marginTop: 16, width: '100%', padding: '10px 20px', background: saving || !text.trim() ? '#b3d4ff' : '#0052CC', color: '#fff', border: 'none', borderRadius: 8, cursor: saving || !text.trim() ? 'default' : 'pointer', fontSize: 14, fontWeight: 500, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save Note'}</button>
      </div>

      {/* Right panel — preview */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7', padding: 40 }}>
        <div style={{ paddingTop: attach !== 'none' ? 24 : 0 }}>
          <div style={{ padding: 20, background: color, borderRadius: 2, boxShadow: '3px 5px 12px rgba(0,0,0,0.12)', fontFamily, fontSize: noteFontSize, lineHeight: noteLH, whiteSpace: 'pre-wrap', textAlign, transform: 'rotate(-1deg)', width: noteWidth, minHeight: noteMinH, color: '#333', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: vertAlign === 'middle' ? 'center' : vertAlign === 'bottom' ? 'flex-end' : 'flex-start' }}>
            {attach === 'tape' && <div style={{ position: 'absolute', top: -(tapeH / 2), left: '50%', transform: 'translateX(-50%) rotate(2deg)', width: tapeW, height: tapeH, background: tapeColor, borderRadius: 1 }} />}
            {attach === 'pin' && <div style={{ position: 'absolute', top: -(pinH * 0.7), left: '50%', transform: 'translateX(-50%)', width: pinW, height: pinH }} dangerouslySetInnerHTML={{ __html: PIN_SVG }} />}
            <div>{text || 'Your note here...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
