import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function App() {
  const [code, setCode] = useState('');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['markdown-renderer'] === false) setDisabled(true); });
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      setCode(config.code || '');
    });
  }, []);

  if (disabled) return <p style={{ color: '#6b778c' }}>This macro has been disabled by your site administrator.</p>;
  if (!code) return <p style={{ color: '#6b778c' }}>No content configured. Edit this macro to add Markdown.</p>;

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{code}</ReactMarkdown>;
}
