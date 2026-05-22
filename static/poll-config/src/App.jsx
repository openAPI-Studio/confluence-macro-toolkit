import React, { useState, useEffect } from 'react';
import { view, invoke } from '@forge/bridge';

const POLL_TYPES = [
  { value: 'single', label: 'Single Answer' },
  { value: 'multi', label: 'Multiple Answers' },
  { value: 'thumbs', label: 'Thumbs Up / Down' },
  { value: 'emoji', label: 'Emoji Reactions' },
];

const DEFAULT_EMOJIS = ['👍', '👎', '❤️', '🎉', '😂', '😮'];

export default function App() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [emojis, setEmojis] = useState(['👍', '❤️', '🎉']);
  const [pollType, setPollType] = useState('single');
  const [allowRevoke, setAllowRevoke] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alignment, setAlignment] = useState('left');

  useEffect(() => {
    view.getContext().then(async (ctx) => {
      const config = ctx.extension.config || {};
      if (config.pollKey) {
        const poll = await invoke('getPoll', { pollKey: config.pollKey });
        if (poll.question) setQuestion(poll.question);
        if (poll.options) setOptions(poll.options);
        if (poll.pollType) setPollType(poll.pollType);
        if (poll.allowRevoke !== undefined) setAllowRevoke(poll.allowRevoke);
        if (poll.emojis) setEmojis(poll.emojis);
        if (poll.alignment) setAlignment(poll.alignment);
      }
    });
  }, []);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => { const c = [...options]; c[i] = val; setOptions(c); };

  const handleSave = async () => {
    const filtered = pollType === 'thumbs' ? ['👍', '👎'] : pollType === 'emoji' ? emojis : options.filter((o) => o.trim());
    if (pollType !== 'thumbs' && pollType !== 'emoji' && (!question.trim() || filtered.length < 2)) return;
    if ((pollType === 'single' || pollType === 'multi') && filtered.length < 2) return;
    setSaving(true);

    const ctx = await view.getContext();
    const contentId = ctx.extension.content.id;
    const macroId = ctx.extension.macro?.id || ctx.localId || Date.now().toString();

    const result = await invoke('savePoll', {
      contentId, macroId, question: question.trim(), options: filtered, pollType, allowRevoke, alignment, emojis: pollType === 'emoji' ? emojis : undefined,
    });

    view.submit({ config: { pollKey: result.pollKey, question: question.trim(), pollType, updatedAt: new Date().toISOString() } });
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Create Poll</h3>
        <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Poll Type</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 16 }}>
        {POLL_TYPES.map((t) => (
          <button key={t.value} onClick={() => setPollType(t.value)}
            style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, background: pollType === t.value ? '#0052CC' : '#fff', color: pollType === t.value ? '#fff' : '#333', cursor: 'pointer', fontSize: 13 }}>
            {t.label}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>Question</label>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..."
        style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, marginBottom: 16, boxSizing: 'border-box' }} />

      {pollType !== 'thumbs' && pollType !== 'emoji' && (
        <>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Options</label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
                style={{ flex: 1, padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4 }} />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={addOption} style={{ marginTop: 12, padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>+ Add option</button>
        </>
      )}

      {pollType === 'emoji' && (
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
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b778c' }}>Or type custom emoji:</div>
          <input value={emojis.join('')} onChange={(e) => setEmojis([...new Set(e.target.value.match(/\p{Emoji_Presentation}/gu) || [])])}
            style={{ marginTop: 4, padding: 8, fontSize: 18, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }} />
        </>
      )}

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Alignment:</label>
        {['left', 'center', 'right'].map((a) => (
          <button key={a} onClick={() => setAlignment(a)}
            style={{ padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, background: alignment === a ? '#0052CC' : '#fff', color: alignment === a ? '#fff' : '#333', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
            {a}
          </button>
        ))}
      </div>

      {pollType !== 'thumbs' && pollType !== 'emoji' && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="revoke" checked={allowRevoke} onChange={(e) => setAllowRevoke(e.target.checked)} />
          <label htmlFor="revoke" style={{ fontSize: 13 }}>Allow users to revoke their vote</label>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save Poll'}</button>
      </div>
    </div>
  );
}
