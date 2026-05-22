import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';

export default function App() {
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['poll-vote'] === false) setDisabled(true); });
    view.getContext().then(async (ctx) => {
      const config = ctx.extension.config || {};
      if (config.pollKey) {
        const data = await invoke('getPoll', { pollKey: config.pollKey });
        setPoll(data);
        if (data.myVote !== undefined && data.myVote !== null) {
          setHasVoted(true);
          setSelected(data.myVote);
        }
      }
      setLoading(false);
    });
  }, []);

  const getPollKey = async () => {
    const ctx = await view.getContext();
    return ctx.extension.config?.pollKey;
  };

  const handleVote = async () => {
    if (selected === null || !poll || voting) return;
    if (poll.pollType === 'multi' && Array.isArray(selected) && selected.length === 0) return;
    setVoting(true);
    const pollKey = await getPollKey();
    const updated = await invoke('castVote', { pollKey, optionIndex: selected });
    setPoll(updated);
    setHasVoted(true);
    setVoting(false);
  };

  const handleThumbsClick = async (i) => {
    if (voting) return;
    setVoting(true);
    const pollKey = await getPollKey();
    if (selected === i) {
      const updated = await invoke('revokeVote', { pollKey });
      setPoll(updated);
      setSelected(null);
      setHasVoted(false);
    } else {
      const updated = await invoke('castVote', { pollKey, optionIndex: i });
      setPoll(updated);
      setSelected(i);
      setHasVoted(true);
    }
    setVoting(false);
  };

  const handleRevoke = async () => {
    if (!poll?.allowRevoke) return;
    const pollKey = await getPollKey();
    const updated = await invoke('revokeVote', { pollKey });
    setPoll(updated);
    setHasVoted(false);
    setSelected(poll.pollType === 'multi' ? [] : null);
  };

  const toggleMulti = (i) => {
    const arr = Array.isArray(selected) ? [...selected] : [];
    if (arr.includes(i)) setSelected(arr.filter((x) => x !== i));
    else setSelected([...arr, i]);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading poll...</div>;
  if (disabled) return <p style={{ color: 'var(--ds-text-subtlest, #6b778c)', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!poll) return <p style={{ color: 'var(--ds-text-subtlest, #6b778c)', padding: 16 }}>No poll configured. Edit this macro to create a poll.</p>;

  const totalVotes = Object.keys(poll.votes || {}).length;
  const pollType = poll.pollType || 'single';
  const align = poll.alignment || 'left';

  const voteCounts = poll.options.map((_, i) => {
    if (pollType === 'multi') return Object.values(poll.votes || {}).filter((v) => Array.isArray(v) && v.includes(i)).length;
    return Object.values(poll.votes || {}).filter((v) => v === i).length;
  });

  const votersByOption = poll.options.map((_, i) => {
    if (pollType === 'multi') return Object.entries(poll.votes || {}).filter(([, v]) => Array.isArray(v) && v.includes(i)).map(([uid]) => poll.voterNames?.[uid] || uid);
    return Object.entries(poll.votes || {}).filter(([, v]) => v === i).map(([uid]) => poll.voterNames?.[uid] || uid);
  });

  // Thumbs/Emoji mode — always interactive, toggle voting
  if (pollType === 'thumbs' || pollType === 'emoji') {
    return (
      <div style={{ padding: 16, fontFamily: 'inherit', textAlign: align }}>
        {poll.question && <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{poll.question}</h3>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
          {poll.options.map((opt, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <button onClick={() => handleThumbsClick(i)}
                style={{ padding: '10px 20px', fontSize: 28, border: selected === i ? '2px solid #0052CC' : '2px solid #eee', borderRadius: 8, background: selected === i ? '#E9F2FF' : '#fff', cursor: voting ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: voting ? 0.6 : 1, transform: selected === i ? 'scale(1.1)' : 'scale(1)' }}>
                {opt}
              </button>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ds-text-subtlest, #6b778c)' }}>{voteCounts[i]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single/Multi — voting UI
  if (!hasVoted) {
    return (
      <div style={{ padding: 16, fontFamily: 'inherit', maxWidth: 500, textAlign: align }}>
        {poll.question && <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>{poll.question}</h3>}
        {pollType === 'multi' ? (
          poll.options.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={Array.isArray(selected) && selected.includes(i)} onChange={() => toggleMulti(i)} />
              <span style={{ fontSize: 14 }}>{opt}</span>
            </label>
          ))
        ) : (
          poll.options.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
              <input type="radio" name="poll" checked={selected === i} onChange={() => setSelected(i)} />
              <span style={{ fontSize: 14 }}>{opt}</span>
            </label>
          ))
        )}
        <button onClick={handleVote}
          disabled={voting || selected === null || (pollType === 'multi' && (!Array.isArray(selected) || selected.length === 0))}
          style={{ marginTop: 12, padding: '8px 20px', background: voting ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }}>
          {voting ? 'Voting...' : 'Vote'}
        </button>
        {totalVotes > 0 && <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--ds-text-subtlest, #6b778c)' }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>}
      </div>
    );
  }

  // Results UI
  return (
    <div style={{ padding: 16, fontFamily: 'inherit', maxWidth: 500, textAlign: align }}>
      {poll.question && <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>{poll.question}</h3>}
      {poll.options.map((opt, i) => {
        const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
        const isMyVote = pollType === 'multi' ? (Array.isArray(selected) && selected.includes(i)) : selected === i;
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
              <span>{opt} {isMyVote && '✓'}</span>
              <span style={{ color: '#0052CC', cursor: 'pointer', fontSize: 12 }} onClick={() => setExpanded(expanded === i ? null : i)}>
                {voteCounts[i]} vote{voteCounts[i] !== 1 ? 's' : ''} ({pct}%)
              </span>
            </div>
            <div style={{ background: 'var(--ds-background-neutral, #eee)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ background: isMyVote ? '#0052CC' : '#4C9AFF', width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            {expanded === i && votersByOption[i].length > 0 && (
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ds-text-subtlest, #6b778c)', paddingLeft: 8 }}>{votersByOption[i].join(', ')}</div>
            )}
          </div>
        );
      })}
      <p style={{ fontSize: 13, color: 'var(--ds-text-subtlest, #6b778c)', marginTop: 12 }}>Total: {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
      {poll.allowRevoke && (
        <button onClick={handleRevoke} style={{ marginTop: 8, padding: '6px 14px', background: 'var(--ds-surface, #fff)', color: '#de350b', border: '1px solid #de350b', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          Revoke my vote
        </button>
      )}
    </div>
  );
}
