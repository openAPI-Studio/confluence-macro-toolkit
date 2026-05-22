import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [voting, setVoting] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['mood-macro'] === false) setDisabled(true); });
    view.getContext().then(async (ctx) => {
      const config = ctx.extension.config || {};
      if (config.moodKey) {
        const data = await invoke('getMood', { moodKey: config.moodKey });
        setMood(data);
        if (data.myVote) setMyVote(data.myVote);
      }
      setLoading(false);
    });
  }, []);

  const getMoodKey = async () => {
    const ctx = await view.getContext();
    return ctx.extension.config?.moodKey;
  };

  const handleVote = async (value) => {
    if (voting || !value.trim()) return;
    setVoting(true);
    const moodKey = await getMoodKey();
    const updated = await invoke('castMoodVote', { moodKey, value: value.trim() });
    setMood(updated);
    setMyVote(value.trim());
    setInput('');
    setVoting(false);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (disabled) return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!mood) return <p style={{ color: '#6b778c', padding: 16 }}>No mood board configured. Edit this macro to set it up.</p>;

  const votes = mood.votes || {};
  const entries = Object.entries(votes);
  const maxVotes = Math.max(1, ...entries.map(([, v]) => v.length));

  return (
    <div style={{ padding: 16 }}>
      {mood.title && <h3 style={{ margin: '0 0 12px', fontSize: 16, textAlign: 'center' }}>{mood.title}</h3>}

      {/* Floating bubbles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 150, gap: 8, padding: 16 }}>
        {entries.length === 0 && <p style={{ color: '#6b778c', fontSize: 14 }}>No votes yet. Be the first!</p>}
        {entries
          .sort((a, b) => b[1].length - a[1].length)
          .map(([value, voters], i) => {
            const ratio = voters.length / maxVotes;
            const fontSize = 14 + ratio * 34;
            const isMyVote = myVote === value;
            const delay = (i * 0.7) % 4;
            return (
              <button
                key={value}
                onClick={() => handleVote(value)}
                style={{
                  fontSize, padding: '4px 8px', border: isMyVote ? '2px solid #0052CC' : '2px solid transparent',
                  borderRadius: 8, background: 'transparent',
                  cursor: voting ? 'wait' : 'pointer', transition: 'all 0.3s',
                  animation: `float ${2.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${delay}s`, opacity: voting ? 0.6 : 1,
                }}
              >
                {value}
              </button>
            );
          })}
      </div>

      {/* Input area */}
      {mood.moodType === 'custom' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value.slice(0, 20))}
            placeholder="Type your mood (max 20)"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && handleVote(input)}
            style={{ padding: '8px 12px', fontSize: 14, border: '1px solid var(--ds-border, #ccc)', borderRadius: 4, width: 200 }}
          />
          <button onClick={() => handleVote(input)} disabled={!input.trim() || voting}
            style={{ padding: '8px 16px', background: '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, opacity: voting ? 0.6 : 1 }}>
            {voting ? '...' : 'Add'}
          </button>
        </div>
      )}

      {mood.moodType === 'emoji' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          {(mood.emojis || []).map((e) => (
            <button key={e} onClick={() => handleVote(e)} disabled={voting}
              style={{ fontSize: 22, padding: '6px 10px', border: myVote === e ? '2px solid #0052CC' : '2px solid var(--ds-border, #eee)', borderRadius: 8, background: myVote === e ? '#E9F2FF' : 'var(--ds-surface, #fff)', cursor: voting ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: voting ? 0.6 : 1 }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
