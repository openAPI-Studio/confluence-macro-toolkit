import React, { useState, useEffect, useRef } from 'react';
import { view, invoke } from '@forge/bridge';

const BUTTON_STYLES = ['arrows', 'dots', 'both', 'none'];
const TRANSITIONS = ['slide', 'fade', 'zoom', 'flip'];
const INTERVALS = [{ value: 2000, label: '2s' }, { value: 3000, label: '3s' }, { value: 5000, label: '5s' }, { value: 8000, label: '8s' }];

export default function App() {
  const [images, setImages] = useState([]);
  const [buttonStyle, setButtonStyle] = useState('both');
  const [transition, setTransition] = useState('slide');
  const [autoPlay, setAutoPlay] = useState(true);
  const [interval, setInterval_] = useState(3000);
  const [loop, setLoop] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageImages, setPageImages] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    view.getContext().then(async (ctx) => {
      const c = ctx.extension.config || {};
      if (c.buttonStyle) setButtonStyle(c.buttonStyle);
      if (c.transition) setTransition(c.transition);
      if (c.autoPlay !== undefined) setAutoPlay(c.autoPlay);
      if (c.interval) setInterval_(c.interval);
      if (c.loop !== undefined) setLoop(c.loop);
      if (c.attachmentIds && c.attachmentIds.length) {
        const result = await invoke('getImageUrls', { attachmentIds: c.attachmentIds, contentId: ctx.extension.content.id });
        setImages(result.images || []);
      }
      // Load existing page attachments
      const pageResult = await invoke('listPageImages', { contentId: ctx.extension.content.id });
      setPageImages(pageResult.images || []);
    });
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const ctx = await view.getContext();
    const contentId = ctx.extension.content.id;

    for (const file of files) {
      const reader = new FileReader();
      const dataUrl = await new Promise((res) => { reader.onload = () => res(reader.result); reader.readAsDataURL(file); });
      const result = await invoke('uploadImage', { contentId, filename: file.name, dataUrl });
      if (result.id) setImages((prev) => [...prev, { id: result.id, url: dataUrl, name: file.name }]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (id) => setImages(images.filter((img) => img.id !== id));

  const handleSave = () => {
    setSaving(true);
    view.submit({ config: { attachmentIds: images.map((i) => i.id), buttonStyle, transition, autoPlay, interval, loop } });
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Carousel / Slideshow</h3>
        <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Images</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, marginBottom: 8 }}>
        {images.map((img) => (
          <div key={img.id} style={{ position: 'relative', width: 80, height: 60, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }}>✕</button>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ fontSize: 13 }} />
      {uploading && <span style={{ marginLeft: 8, fontSize: 12, color: '#6b778c' }}>Uploading...</span>}

      {pageImages.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Existing page attachments (click to add)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {pageImages.filter((pi) => !images.find((i) => i.id === pi.id)).map((img) => (
              <div key={img.id} onClick={() => setImages((prev) => [...prev, img])}
                style={{ width: 60, height: 45, borderRadius: 4, overflow: 'hidden', border: '2px solid #eee', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}>
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} title={img.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Button Style</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 12 }}>
          {BUTTON_STYLES.map((s) => (
            <button key={s} onClick={() => setButtonStyle(s)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: buttonStyle === s ? '#0052CC' : '#fff', color: buttonStyle === s ? '#fff' : '#333', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Transition</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 12 }}>
          {TRANSITIONS.map((t) => (
            <button key={t} onClick={() => setTransition(t)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: transition === t ? '#0052CC' : '#fff', color: transition === t ? '#fff' : '#333', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} /> Auto-play</label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Loop</label>
      </div>

      {autoPlay && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Interval</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {INTERVALS.map((i) => (
              <button key={i.value} onClick={() => setInterval_(i.value)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: interval === i.value ? '#0052CC' : '#fff', color: interval === i.value ? '#fff' : '#333', cursor: 'pointer', fontSize: 12 }}>{i.label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving || images.length === 0} style={{ padding: '8px 20px', background: saving || images.length === 0 ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
}
