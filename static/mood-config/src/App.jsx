import React, { useState, useEffect } from 'react';
import { view, invoke } from '@forge/bridge';

const DEFAULT_EMOJIS = ['😀', '😢', '😡', '🎉', '😴', '❤️', '🔥', '👏'];

export default function App() {
  const [moodType, setMoodType] = useState('custom');
  const [emojis, setEmojis] = useState(['😀', '😢', '😡', '🎉', '😴']);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    view.getContext().then(async (ctx) => {
      const config = ctx.extension.config || {};
      if (config.moodKey) {
        const mood = await invoke('getMood', { moodKey: config.moodKey });
        if (mood.moodType) setMoodType(mood.moodType);
        if (mood.emojis) setEmojis(mood.emojis);
        if (mood.title) setTitle(mood.title);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const ctx = await view.getContext();
    const contentId = ctx.extension.content.id;
    const macroId = ctx.extension.macro?.id || ctx.localId || Date.now().toString();
    const result = await invoke('saveMood', { contentId, macroId, moodType, emojis, title: title.trim() });
    view.submit({ config: { moodKey: result.moodKey, moodType, title: title.trim(), updatedAt: new Date().toISOString() } });
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Create Mood Board</h3>
        <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Type</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 16 }}>
        <button onClick={() => setMoodType('custom')} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, background: moodType === 'custom' ? '#0052CC' : '#fff', color: moodType === 'custom' ? '#fff' : '#333', cursor: 'pointer', fontSize: 13 }}>Custom Text</button>
        <button onClick={() => setMoodType('emoji')} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, background: moodType === 'emoji' ? '#0052CC' : '#fff', color: moodType === 'emoji' ? '#fff' : '#333', cursor: 'pointer', fontSize: 13 }}>Emoji Set</button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Title (optional)</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How are you feeling?"
        style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, marginBottom: 16, boxSizing: 'border-box' }} />

      {moodType === 'emoji' && (
        <>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Emojis (click to toggle)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {DEFAULT_EMOJIS.map((e) => (
              <button key={e} onClick={() => emojis.includes(e) ? setEmojis(emojis.filter(x => x !== e)) : setEmojis([...emojis, e])}
                style={{ fontSize: 24, padding: '6px 10px', border: emojis.includes(e) ? '2px solid #0052CC' : '2px solid #eee', borderRadius: 8, background: emojis.includes(e) ? '#E9F2FF' : '#fff', cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
        </>
      )}

      {moodType === 'custom' && (
        <p style={{ fontSize: 13, color: '#6b778c' }}>Users will type their own text (max 20 characters) to add to the mood board.</p>
      )}

      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
}
