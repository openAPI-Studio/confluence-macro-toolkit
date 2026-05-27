import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fillRule="evenodd" d="M12,2 C14.69,2 16.88,4.12 17,6.78L17,7V10C18.66,10 20,11.34 20,13V19C20,20.66 18.66,22 17,22H7C5.34,22 4,20.66 4,19V13C4,11.34 5.34,10 7,10V7C7,4.24 9.24,2 12,2ZM17,12H7C6.45,12 6,12.45 6,13V19C6,19.55 6.45,20 7,20H17C17.55,20 18,19.55 18,19V13C18,12.45 17.55,12 17,12ZM12,4C10.4,4 9.1,5.25 9,6.82L9,7V10H15V7C15,5.4 13.75,4.1 12.18,4L12,4Z" />
  </svg>
);

const ANIM_MAP = {
  fade: 'fadeReveal 0.5s ease',
  'slide-down': 'slideDown 0.4s ease',
  'slide-up': 'slideUp 0.4s ease',
  zoom: 'zoomReveal 0.4s ease',
  flip: 'flipReveal 0.5s ease',
  typewriter: 'none',
};

export default function App() {
  const [config, setConfig] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['spoiler-reveal'] === false) setDisabled(true); });
    view.getContext().then((ctx) => { setConfig(ctx.extension.config || {}); });
  }, []);

  const handleReveal = () => {
    setRevealed(true);
    if (config.animation === 'typewriter') {
      const chars = config.text.split('');
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx++;
        setTypewriterText(chars.slice(0, idx).join(''));
        if (idx >= chars.length) clearInterval(intervalRef.current);
      }, 30);
    }
  };

  const handleHide = () => {
    setRevealed(false);
    setTypewriterText('');
    clearInterval(intervalRef.current);
  };

  if (disabled) return <p style={{ color: 'var(--ds-text-subtlest, #626F86)', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!config || !config.text) return <p style={{ color: 'var(--ds-text-subtlest, #626F86)', padding: 16 }}>No spoiler configured. Edit this macro to add hidden content.</p>;

  const { text, pattern = 'blur', color = '#2c3e50', animation = 'fade', buttonText = 'Reveal' } = config;

  // Card wrapper — same dimensions whether hidden or revealed
  return (
    <div style={{
      borderRadius: 10,
      border: '1px solid var(--ds-border, #e0e0e0)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      minHeight: 80,
    }}>
      {!revealed ? (
        <div onClick={handleReveal} style={{
          position: 'relative',
          minHeight: 80,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: color,
          overflow: 'hidden',
        }}>
          {/* Pattern overlays */}
          {pattern === 'blur' && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color} 0%, ${color}dd 30%, ${color}aa 60%, ${color}dd 100%)` }} />}
          {pattern === 'bars' && <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 3px, ${color}88 3px, ${color}88 7px)` }} />}
          {pattern === 'pixels' && <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${color} 0% 25%, ${color}bb 0% 50%) 0 0 / 14px 14px` }} />}
          {pattern === 'blackout' && <div style={{ position: 'absolute', inset: 0, background: color }} />}
          {pattern === 'redacted' && <div style={{ position: 'absolute', inset: 0, background: color, display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: 16, gap: 6 }}>
            {text.split(' ').slice(0, 12).map((_, i) => <span key={i} style={{ display: 'inline-block', background: `${color}44`, border: `1px solid ${color}66`, borderRadius: 3, height: 12, width: 20 + (i * 7) % 40 }} />)}
          </div>}

          {/* Button */}
          <div style={{
            position: 'relative', zIndex: 1,
            padding: buttonText ? '10px 20px' : '12px 14px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            fontSize: 13, fontWeight: 600,
            color: '#333',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform 0.15s',
          }}>
            <LockIcon size={buttonText ? 15 : 20} /> {buttonText}
          </div>
          <div style={{ position: 'relative', zIndex: 1, marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Click to reveal</div>
        </div>
      ) : (
        <div style={{ position: 'relative', minHeight: 80 }}>
          {/* Revealed content */}
          <div style={{
            padding: 20,
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            color: 'var(--ds-text, #172B4D)',
            animation: ANIM_MAP[animation] !== 'none' ? ANIM_MAP[animation] : undefined,
          }}>
            {animation === 'typewriter' ? typewriterText : text}
            {animation === 'typewriter' && typewriterText.length < text.length && <span style={{ borderRight: '2px solid currentColor', animation: 'fadeReveal 1s infinite', marginLeft: 1 }}>&nbsp;</span>}
          </div>

          {/* Hide button */}
          <button onClick={handleHide} style={{
            position: 'absolute', top: 10, right: 10,
            padding: '6px 8px',
            fontSize: 11, fontWeight: 500,
            background: 'var(--ds-background-neutral, #f0f1f4)',
            border: '1px solid var(--ds-border, #ddd)',
            borderRadius: 16,
            cursor: 'pointer',
            color: 'var(--ds-text-subtlest, #626F86)',
            display: 'flex', alignItems: 'center',
            transition: 'background 0.15s',
          }}>
            <LockIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
