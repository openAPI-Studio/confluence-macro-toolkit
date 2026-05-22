import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';

function Preview({ style, speed, theme }) {
  const [text, setText] = useState('');
  const [tick, setTick] = useState(0);
  const sampleText = 'The quick brown fox jumps over the lazy dog.';

  const THEMES = {
    none: { background: '#f4f5f7', color: '#333' },
    terminal: { background: '#1e1e1e', color: '#00ff41', fontFamily: 'monospace' },
    retro: { background: '#0a0a0a', color: '#33ff33', fontFamily: '"Courier New", monospace' },
    matrix: { background: '#000', color: '#00ff00', fontFamily: 'monospace' },
    paper: { background: '#fdf6e3', color: '#333', fontFamily: 'Georgia, serif' },
    blueprint: { background: '#1a3a5c', color: '#fff', fontFamily: 'monospace' },
    hacker: { background: '#0d0208', color: '#00ff41', fontFamily: '"Courier New", monospace' },
  };

  // Re-trigger on any prop change
  useEffect(() => {
    setTick(t => t + 1);
  }, [style, speed, theme]);

  useEffect(() => {
    setText('');
    if (style === 'fade') { setText(sampleText); return; }

    let units;
    if (style === 'word') units = sampleText.split(/(\s+)/);
    else if (style === 'line') units = sampleText.split(/(\n)/);
    else units = sampleText.split('');

    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setText(units.slice(0, idx).join(''));
      if (idx >= units.length) {
        clearInterval(iv);
        setTimeout(() => setText(''), 2000);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [tick]);

  const themeStyle = THEMES[theme] || THEMES.none;

  return (
    <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, fontSize: 13, minHeight: 24, ...themeStyle }}>
      {text || '\u00A0'}
      <span style={{ animation: 'blink 1s infinite', borderRight: '2px solid currentColor' }}>&nbsp;</span>
    </div>
  );
}

const STYLES = [
  { value: 'typewriter', label: 'Typewriter (letter by letter)' },
  { value: 'word', label: 'Word by word' },
  { value: 'line', label: 'Line by line' },
  { value: 'fade', label: 'Fade in' },
];

const SPEEDS = [
  { value: 20, label: 'Fast' },
  { value: 50, label: 'Medium' },
  { value: 100, label: 'Slow' },
  { value: 150, label: 'Very Slow' },
];

const THEMES = [
  { value: 'none', label: 'None', preview: { bg: 'transparent', color: 'inherit' } },
  { value: 'terminal', label: 'Terminal', preview: { bg: '#1e1e1e', color: '#00ff41' } },
  { value: 'retro', label: 'Retro Monitor', preview: { bg: '#0a0a0a', color: '#33ff33', font: 'monospace' } },
  { value: 'matrix', label: 'Matrix', preview: { bg: '#000', color: '#00ff00' } },
  { value: 'paper', label: 'Paper', preview: { bg: '#fdf6e3', color: '#333' } },
  { value: 'blueprint', label: 'Blueprint', preview: { bg: '#1a3a5c', color: '#fff' } },
  { value: 'hacker', label: 'Hacker', preview: { bg: '#0d0208', color: '#00ff41', font: 'monospace' } },
];

export default function App() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(50);
  const [style, setStyle] = useState('typewriter');
  const [theme, setTheme] = useState('none');
  const [showCursor, setShowCursor] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.text) setText(c.text);
      if (c.speed) setSpeed(c.speed);
      if (c.style) setStyle(c.style);
      if (c.theme) setTheme(c.theme);
      if (c.showCursor !== undefined) setShowCursor(c.showCursor);
      if (c.showLineNumbers !== undefined) setShowLineNumbers(c.showLineNumbers);
    });
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaving(true);
    view.submit({ config: { text, speed, style, theme, showCursor, showLineNumbers } });
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Typewriter Effect</h3>
        <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Render Style</label>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {STYLES.map(s => (
          <button key={s.value} onClick={() => setStyle(s.value)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: style === s.value ? '#0052CC' : '#fff', color: style === s.value ? '#fff' : '#333', cursor: 'pointer', fontSize: 12 }}>{s.label}</button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Speed</label>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16 }}>
        {SPEEDS.map(s => (
          <button key={s.value} onClick={() => setSpeed(s.value)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: speed === s.value ? '#0052CC' : '#fff', color: speed === s.value ? '#fff' : '#333', cursor: 'pointer', fontSize: 12 }}>{s.label}</button>
        ))}
      </div>

      <Preview style={style} speed={speed} theme={theme} />

      <label style={{ fontSize: 13, fontWeight: 500 }}>Theme</label>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {THEMES.map(t => (
          <button key={t.value} onClick={() => setTheme(t.value)} style={{ padding: '6px 12px', border: theme === t.value ? '2px solid #0052CC' : '2px solid #eee', borderRadius: 6, background: t.preview.bg === 'transparent' ? '#fff' : t.preview.bg, color: t.preview.color === 'inherit' ? '#333' : t.preview.color, cursor: 'pointer', fontSize: 11, fontFamily: t.preview.font || 'inherit' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={showCursor} onChange={e => setShowCursor(e.target.checked)} /> Blinking cursor</label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={showLineNumbers} onChange={e => setShowLineNumbers(e.target.checked)} /> Line numbers</label>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Content</label>
      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Enter the text to animate..."
        style={{ width: '100%', minHeight: 200, padding: 10, fontSize: 14, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
      />

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving || !text.trim()} style={{ padding: '8px 20px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
}
