import React, { useEffect, useState, useRef, useCallback } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [images, setImages] = useState(null);
  const [current, setCurrent] = useState(0);
  const [transition, setTransition] = useState('slide');
  const [controls, setControls] = useState('both');
  const [autoplay, setAutoplay] = useState(0);
  const [loop, setLoop] = useState(true);
  const [animating, setAnimating] = useState(false);
  const autoRef = useRef(null);
  const touchRef = useRef({ x: 0 });

  useEffect(() => {
    view.getContext().then(async (ctx) => {
      const c = ctx.extension.config || {};
      if (c.transition) setTransition(c.transition);
      if (c.controls) setControls(c.controls);
      if (c.autoplay) setAutoplay(Number(c.autoplay));
      if (c.loop !== undefined) setLoop(c.loop === 'true' || c.loop === true);
      if (c.images) {
        try {
          const parsed = JSON.parse(c.images);
          const contentId = ctx.extension.content?.id || ctx.contentId || '';
          if (parsed.length) {
            const { images: resolved } = await invoke('getImageUrls', { attachmentIds: parsed.map((i) => i.id), contentId });
            setImages(resolved || []);
          } else { setImages([]); }
        } catch { setImages([]); }
      } else { setImages([]); }
    });
  }, []);

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((prev) => {
      const len = images?.length || 1;
      let next = prev + dir;
      if (loop) { next = (next + len) % len; }
      else { next = Math.max(0, Math.min(len - 1, next)); }
      return next;
    });
    setTimeout(() => setAnimating(false), 500);
  }, [images, loop, animating]);

  // Autoplay
  useEffect(() => {
    if (autoplay && images?.length > 1) {
      autoRef.current = setInterval(() => go(1), autoplay);
      return () => clearInterval(autoRef.current);
    }
  }, [autoplay, images, go]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [go]);

  if (images === null) return null;
  if (images.length === 0) return <p style={{ color: 'var(--ds-text-subtlest, #626F86)', padding: 16 }}>No images configured. Edit this macro to add images.</p>;

  const showArrows = controls === 'arrows' || controls === 'both';
  const showDots = controls === 'dots' || controls === 'both';

  const getStyle = (i) => {
    const active = i === current;
    const base = { position: 'absolute', inset: 0, transition: 'all 0.5s ease', opacity: 0, transform: 'scale(1)' };
    if (transition === 'fade') return { ...base, opacity: active ? 1 : 0, zIndex: active ? 1 : 0 };
    if (transition === 'zoom') return { ...base, opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(0.8)', zIndex: active ? 1 : 0 };
    if (transition === 'flip') return { ...base, opacity: active ? 1 : 0, transform: active ? 'rotateY(0deg)' : 'rotateY(90deg)', zIndex: active ? 1 : 0 };
    // slide
    const offset = (i - current) * 100;
    return { ...base, opacity: 1, transform: `translateX(${offset}%)`, zIndex: 0 };
  };

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', overflow: 'hidden', borderRadius: 8, background: 'var(--ds-surface-sunken, #f4f5f7)' }}
      onTouchStart={(e) => { touchRef.current.x = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const diff = touchRef.current.x - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1); }}
    >
      {images.map((img, i) => (
        <div key={img.id || i} style={getStyle(i)}>
          <img src={img.url} alt={img.name || ''} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0 }} loading="lazy" />
        </div>
      ))}

      {showArrows && images.length > 1 && (
        <>
          <button onClick={() => go(-1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => go(1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 6 }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => { setCurrent(i); }} style={{ width: 8, height: 8, borderRadius: '50%', background: i === current ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}
