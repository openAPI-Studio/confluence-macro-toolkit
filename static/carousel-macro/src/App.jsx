import React, { useEffect, useState, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

const ANIM = { slide: 'slideIn 0.4s ease', fade: 'fadeIn 0.5s ease', zoom: 'zoomIn 0.4s ease', flip: 'flipIn 0.5s ease' };

export default function App() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['carousel-macro'] === false) { setLoading(false); return; } });
    view.getContext().then(async (ctx) => {
      const c = ctx.extension.config || {};
      setConfig(c);
      if (c.attachmentIds && c.attachmentIds.length) {
        const contentId = ctx.extension.content.id;
        const result = await invoke('getImageUrls', { attachmentIds: c.attachmentIds, contentId });
        setImages(result.images || []);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!config?.autoPlay || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((p) => {
        const next = p + 1;
        if (next >= images.length) return config.loop ? 0 : p;
        return next;
      });
      setAnimKey((k) => k + 1);
    }, config.interval || 3000);
    return () => clearInterval(timerRef.current);
  }, [config, images.length]);

  const go = (dir) => {
    setCurrent((p) => {
      let next = p + dir;
      if (next < 0) next = config?.loop ? images.length - 1 : 0;
      if (next >= images.length) next = config?.loop ? 0 : images.length - 1;
      return next;
    });
    setAnimKey((k) => k + 1);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!images.length) return <p style={{ color: '#6b778c', padding: 16 }}>No images configured. Edit this macro to add images.</p>;

  const showArrows = config?.buttonStyle === 'arrows' || config?.buttonStyle === 'both';
  const showDots = config?.buttonStyle === 'dots' || config?.buttonStyle === 'both';
  const anim = ANIM[config?.transition] || ANIM.slide;

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <div key={animKey} style={{ width: '100%', animation: anim }}>
        <img src={images[current]?.url} style={{ width: '100%', display: 'block', borderRadius: 4 }} />
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button onClick={() => go(-1)} style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>←</button>
          <button onClick={() => go(1)} style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>→</button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setAnimKey((k) => k + 1); }}
              style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: i === current ? '#0052CC' : '#ccc', cursor: 'pointer', transition: 'background 0.2s' }} />
          ))}
        </div>
      )}
    </div>
  );
}
