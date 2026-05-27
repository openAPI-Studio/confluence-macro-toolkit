import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

const TIMEZONES = [
  { label: 'Local', value: '' },
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Chicago (CST)', value: 'America/Chicago' },
  { label: 'Denver (MST)', value: 'America/Denver' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Berlin (CET)', value: 'Europe/Berlin' },
  { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
];

const PATTERNS = [
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Dark', value: 'dark' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Neon', value: 'neon' },
];

const COLORS = ['#0052CC', '#36B37E', '#FF5630', '#6554C0', '#00B8D9', '#FF991F', '#172B4D', '#E91E63', '#8BC34A', '#607D8B'];

const ALIGNMENTS = ['left', 'center', 'right'];

const defaultClock = { type: 'analog', timezone: '', color: '#0052CC', pattern: 'solid', label: '' };

export default function App() {
  const [count, setCount] = useState(1);
  const [clocks, setClocks] = useState([{ ...defaultClock }]);
  const [alignment, setAlignment] = useState('center');

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.clocks) {
        try {
          const parsed = JSON.parse(c.clocks);
          setClocks(parsed);
          setCount(parsed.length);
        } catch {}
      }
      if (c.alignment) setAlignment(c.alignment);
    });
  }, []);

  const updateCount = (n) => {
    setCount(n);
    setClocks((prev) => {
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill(null).map(() => ({ ...defaultClock }))];
      return prev.slice(0, n);
    });
  };

  const updateClock = (i, field, value) => {
    setClocks((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    view.submit({ config: { clocks: JSON.stringify(clocks), alignment } });
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Clock Configuration</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Number of Clocks</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => updateCount(n)} style={{ width: 36, height: 36, border: count === n ? '2px solid #0052CC' : '1px solid #ccc', borderRadius: 4, background: count === n ? '#E9F2FF' : '#fff', cursor: 'pointer', fontWeight: 600 }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Alignment</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {ALIGNMENTS.map((a) => (
            <button key={a} onClick={() => setAlignment(a)} style={{ padding: '4px 12px', border: alignment === a ? '2px solid #0052CC' : '1px solid #ccc', borderRadius: 4, background: alignment === a ? '#E9F2FF' : '#fff', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{a}</button>
          ))}
        </div>
      </div>

      {clocks.map((clock, i) => (
        <div key={i} style={{ padding: 14, marginBottom: 12, border: '1px solid #ddd', borderRadius: 6, background: '#fafbfc' }}>
          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 10 }}>Clock {i + 1}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b778c' }}>Type</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {['analog', 'digital'].map((t) => (
                  <button key={t} onClick={() => updateClock(i, 'type', t)} style={{ padding: '4px 10px', border: clock.type === t ? '2px solid #0052CC' : '1px solid #ccc', borderRadius: 4, background: clock.type === t ? '#E9F2FF' : '#fff', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#6b778c' }}>Timezone</label>
              <select value={clock.timezone} onChange={(e) => updateClock(i, 'timezone', e.target.value)} style={{ width: '100%', marginTop: 4, padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }}>
                {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#6b778c' }}>Pattern</label>
              <select value={clock.pattern} onChange={(e) => updateClock(i, 'pattern', e.target.value)} style={{ width: '100%', marginTop: 4, padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }}>
                {PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#6b778c' }}>Label</label>
              <input value={clock.label} onChange={(e) => updateClock(i, 'label', e.target.value)} placeholder="e.g. New York" style={{ width: '100%', marginTop: 4, padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 12, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, color: '#6b778c' }}>Color</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <div key={c} onClick={() => updateClock(i, 'color', c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: clock.color === c ? '3px solid #172B4D' : '2px solid transparent', boxSizing: 'border-box' }} />
              ))}
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => view.close()} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '8px 16px', background: '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Save</button>
      </div>
    </div>
  );
}
