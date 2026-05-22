import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [config, setConfig] = useState(null);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['typewriter-macro'] === false) setDisabled(true); });
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.text) setConfig(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!config || disabled) return;
    const { text, speed, style } = config;

    if (style === 'fade') {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let units;
    if (style === 'word') units = text.split(/(\s+)/);
    else if (style === 'line') units = text.split(/(\n)/);
    else units = text.split('');

    let idx = 0;
    setDisplayed('');

    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(units.slice(0, idx).join(''));
      if (idx >= units.length) {
        clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [config, disabled]);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (disabled) return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!config) return <p style={{ color: '#6b778c', padding: 16 }}>No content configured. Edit this macro to add text.</p>;

  const THEMES = {
    none: {},
    terminal: { background: '#1e1e1e', color: '#00ff41', padding: 20, borderRadius: 8, fontFamily: 'monospace' },
    retro: { background: '#0a0a0a', color: '#33ff33', padding: 20, borderRadius: 4, fontFamily: '"Courier New", monospace', boxShadow: 'inset 0 0 60px rgba(0,255,0,0.05)' },
    matrix: { background: '#000', color: '#00ff00', padding: 20, borderRadius: 8, fontFamily: 'monospace' },
    paper: { background: '#fdf6e3', color: '#333', padding: 20, borderRadius: 4, fontFamily: 'Georgia, serif', borderLeft: '3px solid #b58900' },
    blueprint: { background: '#1a3a5c', color: '#fff', padding: 20, borderRadius: 8, fontFamily: 'monospace' },
    hacker: { background: '#0d0208', color: '#00ff41', padding: 20, borderRadius: 8, fontFamily: '"Courier New", monospace', border: '1px solid #003b00' },
  };

  const themeStyle = THEMES[config.theme] || {};
  const fadeStyle = config.style === 'fade' ? { animation: 'fadeIn 1.5s ease-in' } : {};

  const lines = displayed.split('\n');

  return (
    <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', ...themeStyle, ...fadeStyle, display: config.showLineNumbers ? 'flex' : 'block' }}>
      {config.showLineNumbers && (
        <div style={{ paddingRight: 12, marginRight: 12, borderRight: '1px solid currentColor', opacity: 0.4, userSelect: 'none', textAlign: 'right', fontFamily: 'monospace' }}>
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {displayed}
        {(!done || config.showCursor) && <span style={{ animation: 'blink 1s infinite', borderRight: '2px solid currentColor', marginLeft: 1 }}>&nbsp;</span>}
      </div>
    </div>
  );
}
