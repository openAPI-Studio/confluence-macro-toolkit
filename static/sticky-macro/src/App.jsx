import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';

const PIN_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -1028.4)"><g transform="matrix(.70711 .70711 -.70711 .70711 737.68 297.72)"><path d="m11 1028.4v13h1 6.406c-0.595-1.1-1.416-2.1-2.406-2.8v-8c0.616-0.6 1.131-1.4 1.531-2.2h-5.531-1z" fill="#c0392b"/><path d="m11 13v2 4 2l1 2v-2-6-2h-1z" transform="translate(0 1028.4)" fill="#bdc3c7"/><path d="m12 13v2 4 2 2l1-2v-2-4-2h-1z" transform="translate(0 1028.4)" fill="#7f8c8d"/><path d="m6.4688 1028.4c0.4006 0.8 0.915 1.6 1.5312 2.2v8c-0.9897 0.7-1.8113 1.7-2.4062 2.8h6.4062v-13h-5.5312z" fill="#e74c3c"/></g></g></svg>';

export default function App() {
  const [config, setConfig] = useState(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['sticky-note'] === false) setDisabled(true); });
    view.getContext().then((ctx) => { setConfig(ctx.extension.config || {}); });
  }, []);

  if (disabled) return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!config || !config.text) return <p style={{ color: '#6b778c', padding: 16 }}>No sticky note configured. Edit this macro to add one.</p>;

  const { text, color = '#FFEB3B', size = 'medium', font = 'handwritten', attach = 'tape', tapeColor = 'rgba(255,255,255,0.6)', textAlign = 'left', vertAlign = 'top', lineSpacing = 'normal' } = config;

  const fontFamily = font === 'handwritten' ? '"Comic Sans MS", "Segoe Script", cursive'
    : font === 'serif' ? 'Georgia, serif'
    : font === 'mono' ? '"Courier New", monospace'
    : '-apple-system, sans-serif';

  const width = size === 'small' ? 150 : size === 'large' ? 300 : size === 'full' ? '100%' : 220;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 20 : 16;
  const padding = size === 'small' ? 12 : size === 'large' ? 24 : 18;
  const minHeight = size === 'small' ? 80 : size === 'large' ? 160 : 120;
  const lineHeight = lineSpacing === 'tight' ? 1.2 : lineSpacing === 'loose' ? 2.2 : 1.6;
  const justifyContent = vertAlign === 'middle' ? 'center' : vertAlign === 'bottom' ? 'flex-end' : 'flex-start';

  const tapeWidth = size === 'small' ? 30 : size === 'large' ? 60 : size === 'full' ? 70 : 40;
  const tapeHeight = size === 'small' ? 10 : size === 'large' ? 16 : 12;
  const pinSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <div style={{ paddingTop: attach !== 'none' ? pinSize : 0 }}>
      <div style={{
        width, minHeight, padding, background: color, color: '#333',
        fontFamily, fontSize, lineHeight, whiteSpace: 'pre-wrap', textAlign,
        display: 'flex', flexDirection: 'column', justifyContent,
        boxShadow: '3px 5px 10px rgba(0,0,0,0.12)',
        transform: 'rotate(-0.5deg)',
        borderRadius: 2,
        position: 'relative',
      }}>
        {attach === 'tape' && (
          <div style={{ position: 'absolute', top: -(tapeHeight / 2), left: '50%', transform: 'translateX(-50%) rotate(2deg)', width: tapeWidth, height: tapeHeight, background: tapeColor, borderRadius: 1 }} />
        )}
        {attach === 'pin' && (
          <div style={{ position: 'absolute', top: -(pinSize * 0.7), left: '50%', transform: 'translateX(-50%)', width: pinSize, height: pinSize * 1.2 }} dangerouslySetInnerHTML={{ __html: PIN_SVG }} />
        )}
        <div>{text}</div>
      </div>
    </div>
  );
}
