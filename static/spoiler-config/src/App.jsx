import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';

const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fillRule="evenodd" d="M12,2 C14.69,2 16.88,4.12 17,6.78L17,7V10C18.66,10 20,11.34 20,13V19C20,20.66 18.66,22 17,22H7C5.34,22 4,20.66 4,19V13C4,11.34 5.34,10 7,10V7C7,4.24 9.24,2 12,2ZM17,12H7C6.45,12 6,12.45 6,13V19C6,19.55 6.45,20 7,20H17C17.55,20 18,19.55 18,19V13C18,12.45 17.55,12 17,12ZM12,4C10.4,4 9.1,5.25 9,6.82L9,7V10H15V7C15,5.4 13.75,4.1 12.18,4L12,4Z" />
  </svg>
);

const PATTERNS = [
  { value: 'blur', label: 'Blur' },
  { value: 'bars', label: 'Bars' },
  { value: 'pixels', label: 'Pixels' },
  { value: 'blackout', label: 'Blackout' },
  { value: 'redacted', label: 'Redacted' },
];

const COLORS = [
  { value: '#2c3e50', label: 'Dark Slate' },
  { value: '#34495e', label: 'Charcoal' },
  { value: '#1a365d', label: 'Navy' },
  { value: '#2d3748', label: 'Gunmetal' },
  { value: '#4a5568', label: 'Gray' },
  { value: '#553c9a', label: 'Indigo' },
  { value: '#744210', label: 'Brown' },
  { value: '#1e3a5f', label: 'Steel Blue' },
];

const ANIMATIONS = [
  { value: 'fade', label: 'Fade In' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'flip', label: 'Flip' },
  { value: 'typewriter', label: 'Typewriter' },
];

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: '5px 12px', border: 'none', borderRadius: 20, background: active ? '#0052CC' : '#f0f1f4', color: active ? '#fff' : '#44546f', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.15s' }}>{children}</button>
);

const Label = ({ children }) => <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#5e6c84', marginBottom: 6 }}>{children}</div>;

function PreviewBlock({ text, pattern, color, animation, buttonText }) {
  const [shown, setShown] = useState(false);

  useEffect(() => { setShown(false); }, [pattern, color, animation]);

  if (shown) {
    const animStyle = animation === 'fade' ? { animation: 'fadeIn 0.5s ease' }
      : animation === 'slide-down' ? { animation: 'slideDown 0.4s ease' }
      : animation === 'zoom' ? { animation: 'zoomIn 0.4s ease' }
      : {};
    return (
      <div style={{ maxWidth: 400, width: '100%', position: 'relative' }}>
        <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', borderRadius: 8, background: 'var(--ds-surface, #fff)', border: '1px solid var(--ds-border, #ddd)', ...animStyle }}>
          {text || 'Your hidden content appears here...'}
        </div>
        <button onClick={() => setShown(false)} style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', fontSize: 10, background: '#f0f1f4', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}><LockIcon size={12} /> Hide</button>
      </div>
    );
  }

  return (
    <div onClick={() => setShown(true)} style={{ maxWidth: 400, width: '100%', cursor: 'pointer' }}>
      <div style={{ padding: 20, background: color, borderRadius: 8, color: '#fff', textAlign: 'center', fontSize: 14, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {pattern === 'blur' && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color} 0%, ${color}dd 30%, ${color}aa 60%, ${color}dd 100%)` }} />}
        {pattern === 'bars' && <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 3px, ${color}66 3px, ${color}66 7px)` }} />}
        {pattern === 'pixels' && <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${color} 0% 25%, ${color}dd 0% 50%) 0 0 / 12px 12px` }} />}
        {pattern === 'redacted' && <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 30px, ${color}88 30px, ${color}88 34px)` }} />}
        <span style={{ position: "relative", zIndex: 1, padding: "8px 16px", background: "rgba(255,255,255,0.9)", borderRadius: 16, color: "#333", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}><LockIcon size={14} /> {buttonText}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('blur');
  const [color, setColor] = useState('#1a1a1a');
  const [animation, setAnimation] = useState('fade');
  const [buttonText, setButtonText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.text) setText(c.text);
      if (c.pattern) setPattern(c.pattern);
      if (c.color) setColor(c.color);
      if (c.animation) setAnimation(c.animation);
      if (c.buttonText) setButtonText(c.buttonText);
    });
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaving(true);
    view.submit({ config: { text, pattern, color, animation, buttonText } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ width: 320, padding: '24px 20px', overflowY: 'auto', borderRight: '1px solid #e8e8e8', background: '#fafbfc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Spoiler / Reveal</h3>
          <button onClick={() => view.close()} style={{ width: 28, height: 28, border: 'none', borderRadius: 6, background: '#f0f1f4', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <Label>Cover Pattern</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {PATTERNS.map((p) => <Pill key={p.value} active={pattern === p.value} onClick={() => setPattern(p.value)}>{p.label}</Pill>)}
        </div>

        <Label>Cover Color</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {COLORS.map((c) => (
            <button key={c.value} onClick={() => setColor(c.value)} style={{ width: 28, height: 28, borderRadius: '50%', background: c.value, border: color === c.value ? '2.5px solid #fff' : '2px solid #e0e0e0', cursor: 'pointer', boxShadow: color === c.value ? '0 0 0 2px #0052CC' : 'none' }} title={c.label} />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer' }} />
        </div>

        <Label>Reveal Animation</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {ANIMATIONS.map((a) => <Pill key={a.value} active={animation === a.value} onClick={() => setAnimation(a.value)}>{a.label}</Pill>)}
        </div>

        <Label>Button Text</Label>
        <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #dfe1e6', borderRadius: 8, boxSizing: 'border-box', marginBottom: 20 }} />

        <Label>Hidden Content</Label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter the content to hide..."
          style={{ width: '100%', minHeight: 150, padding: 12, fontSize: 14, border: '1px solid #dfe1e6', borderRadius: 8, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />

        <button onClick={handleSave} disabled={saving || !text.trim()} style={{ marginTop: 16, width: '100%', padding: '10px 20px', background: saving || !text.trim() ? '#b3d4ff' : '#0052CC', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      {/* Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-surface-sunken, #f4f5f7)', padding: 40 }}>
        <div style={{ fontSize: 11, color: 'var(--ds-text-subtlest, #626F86)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Click to preview reveal</div>
        <PreviewBlock text={text} pattern={pattern} color={color} animation={animation} buttonText={buttonText} />
      </div>
    </div>
  );
}
