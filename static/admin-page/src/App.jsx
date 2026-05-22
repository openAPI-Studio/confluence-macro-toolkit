import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

const MACROS = [
  { key: 'mermaid-diagram', name: 'Mermaid Diagram', description: 'Render Mermaid diagrams', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg"><path d="M490.16,84.61C490.16,37.912 452.248,0 405.55,0L84.61,0C37.912,0 0,37.912 0,84.61L0,405.55C0,452.248 37.912,490.16 84.61,490.16L405.55,490.16C452.248,490.16 490.16,452.248 490.16,405.55L490.16,84.61Z" style="fill:#ff3670;"/><path d="M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z" style="fill:white;fill-rule:nonzero;"/></svg>' },
  { key: 'markdown-renderer', name: 'Markdown', description: 'Render Markdown content', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="-10 -5 1034 1034" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M922 319q-1 0-2 1h-11v0h-836q-18 0-33.5 8.5t-25.5 22.5q-17 26-13 57v461q1 18 11 32.5t24 22.5q25 14 55 10v1l843-1q18-1 32.5-11t22.5-24q14-24 10-55h1l-1-459q-1-17-11-31.5t-24-23.5q-19-10-42-11zM918 367h2q12 0 20 5q6 3 8.5 6.5t2.5 9.5l1 456v3q2 16-5 29q-3 5-6.5 7.5t-9.5 2.5l-840 1h-3q-16 2-28-5q-6-3-8.5-6.5t-2.5-9.5v-458l-1-4q-2-14 5.5-25t18.5-11h837zM145 464v327h96v-188l96 120l96-120v188h96v-327h-96l-96 120l-96-120h-96zM697 464v168h-96l144 159l144-159h-96v-168h-96z"/></svg>' },
  { key: 'swagger-api-docs', name: 'Swagger / OpenAPI', description: 'Render API documentation from OpenAPI specs', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g><path d="M127.06,256C58.85,255.53-0.46,198.92,0,127C0.44,57.8,57.95-0.47,129.11,0C198.27,0.46,256.61,57.87,256,128.19C256.57,197.88,197.93,256.49,127.06,256Z" fill="#FFFFFF"/><path d="M127.18,239C68.03,238.59,16.6,189.5,17,127.13C17.39,67.12,67.26,16.59,128.96,17C188.93,17.4,239.53,67.18,239,128.17C239.49,188.6,188.65,239.42,127.18,239Z" fill="#49A32B"/><path d="M169.33,127.96C169.04,133.25,164.42,137.64,159.87,136.87C154.75,136.88,150.66,132.79,150.65,127.75C150.82,122.69,155.02,118.7,160.08,118.79C165.13,118.81,169.6,123.08,169.33,127.96ZM88.2,179.22C90.1,179.28,92.01,179.24,94.2,179.24V193.02C80.57,195.33,69.33,191.46,66.58,179.93C65.64,175.69,65.05,171.38,64.84,167.04C64.55,162.45,65.06,157.81,64.71,153.23C63.74,140.61,62.1,136.31,50,135.71V120.01C50.87,119.81,51.75,119.66,52.63,119.56C59.27,119.24,62.06,117.2,63.55,110.67C64.22,107,64.62,103.28,64.74,99.54C65.27,92.33,65.08,84.99,66.28,77.89C68.02,67.62,74.4,62.64,84.92,62.08C87.92,61.92,90.93,62.05,94.32,62.05V76.14C92.92,76.24,91.64,76.45,90.37,76.41C81.79,76.15,81.35,79.07,80.72,86.17C80.33,90.63,80.87,95.16,80.57,99.62C80.25,104.07,79.65,108.5,78.79,112.87C77.55,119.21,73.65,123.92,68.25,127.92C78.73,134.75,79.93,145.35,80.61,156.11C80.97,161.9,80.81,167.72,81.39,173.48C81.85,177.94,83.59,179.08,88.2,179.22ZM97.04,118.79C102.21,118.87,106.21,123,106.13,128.02C105.83,133.41,101.63,137.15,96.73,136.87C91.15,136.61,87.31,132.36,87.55,127.37C87.8,122.39,92.05,118.54,97.04,118.79ZM128.27,118.79C133.76,118.75,137.4,122.3,137.43,127.72C137.46,133.28,134,136.85,128.56,136.87C123.02,136.89,119.37,133.39,119.34,128C119.48,122.39,123.49,118.64,128.27,118.79ZM193.67,111.92C195.13,117.37,197.97,119.28,203.7,119.55C204.64,119.59,205.58,119.75,206.87,119.89V135.58C206.17,135.81,205.46,135.98,204.73,136.1C197.05,136.57,193.54,139.73,192.77,147.43C192.27,152.35,192.31,157.32,191.97,162.26C191.83,167.68,191.34,173.08,190.5,178.44C188.54,188.14,182.48,192.98,172.47,193.57C169.25,193.76,166,193.6,162.53,193.6V179.58C164.4,179.46,166.05,179.3,167.7,179.26C173.68,179.12,175.8,177.19,176.09,171.25C176.41,164.73,176.56,158.19,176.85,151.67C177.27,142.23,179.85,133.81,188.64,127.92C183.61,124.34,179.58,119.99,178.53,114.14C177.26,107.04,176.86,99.79,176.18,92.59C175.84,89,175.86,85.36,175.5,81.77C175.13,77.89,172.46,76.55,168.93,76.46C166.9,76.41,164.87,76.45,162.28,76.45V62.75C178.79,60.01,190.2,65.51,191.26,81.3C191.7,87.93,191.64,94.6,192.06,101.23C192.25,104.84,192.79,108.42,193.67,111.92Z" fill="#FFFFFF"/></g></svg>' },
  {
    key: 'drawio-diagram',
    name: 'Draw.io Diagram',
    description: 'Create and edit diagrams with Draw.io',
    defaultEnabled: false,
    icon: '<svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="28" height="28" rx="1.12" style="fill:#f08705"/><path d="M16.861,9.168l3.02-3.187L30,16.094V28.88A1.119,1.119,0,0,1,28.88,30H11.316L5.931,24.593Z" style="fill:#df6c0c;fill-rule:evenodd"/><path d="M25.24,17.96H21.946l-3.071-5.32h.2a1.119,1.119,0,0,0,1.12-1.12V6.76a1.119,1.119,0,0,0-1.12-1.12H12.92A1.119,1.119,0,0,0,11.8,6.76v4.76a1.119,1.119,0,0,0,1.12,1.12h.205l-3.071,5.32H6.76a1.119,1.119,0,0,0-1.12,1.12v4.76a1.119,1.119,0,0,0,1.12,1.12h6.16a1.119,1.119,0,0,0,1.12-1.12V19.08a1.119,1.119,0,0,0-1.12-1.12h-.927l3.072-5.32h1.87l3.071,5.32H19.08a1.119,1.119,0,0,0-1.12,1.12v4.76a1.119,1.119,0,0,0,1.12,1.12h6.16a1.119,1.119,0,0,0,1.12-1.12V19.08A1.119,1.119,0,0,0,25.24,17.96Z" style="fill:#fff"/></svg>',
    warning: '⚠️ This macro uses an external service (embed.diagrams.net) for both editing and rendering. Diagram data is sent to draw.io servers. Do not enable if your organization restricts external data sharing.',
  },
  { key: 'poll-vote', name: 'Poll / Vote', description: 'Create polls and collect votes from users', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 297 297" xmlns="http://www.w3.org/2000/svg"><circle style="fill:#34495E;" cx="148.5" cy="148.5" r="148.5"/><path style="fill:#1D3747;" d="M188.953,67.704C160.709,78.958,142.286,90.498,139.5,116.5c-1,8-8,15-11,22c-11,27-14,55-36,77c-7.393,6.571-3.52,19.791-6.984,29.157l52.043,51.941c3.613,0.263,7.261,0.402,10.941,0.402c73.45,0,134.435-53.328,146.373-123.376L188.953,67.704z"/><polygon style="fill:#ECF0F1;" points="214.5,132 214.5,132 198,148.5 99,148.5 82.5,132 99,99 198,99"/><rect x="123.75" y="110.994" style="fill:#345065;" width="49.5" height="5"/><polygon style="fill:#82D9C8;" points="110.402,83.296 143.134,115.011 188.953,67.704 156.221,35.989"/><path style="fill:#D0D5D9;" d="M92.5,247.5h112c5.523,0,10-4.477,10-10V132h-132v105.5C82.5,243.023,86.977,247.5,92.5,247.5z"/><rect x="107.25" y="181.5" style="fill:#5D7486;" width="82.5" height="33"/></svg>' },
  { key: 'mood-macro', name: 'Mood', description: 'Visualize team mood with floating text/emojis', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle fill="#4F5D73" cx="32" cy="32" r="32"/><line fill="none" stroke="#76C2AF" stroke-width="4" stroke-linecap="round" x1="32" y1="24" x2="32" y2="49"/><path fill="#76C2AF" stroke="#76C2AF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M32,53.4c0,0,0-5.8,6.6-9.4c5.8-3.2,10.4-7,10.4-7S48,53.4,32,53.4z"/><path fill="#76C2AF" stroke="#76C2AF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M31.9,53.4c0,0,0-5.8-6.6-9.4C19.6,40.8,15,37,15,37S16,53.4,31.9,53.4z"/><circle fill="#C75C5C" cx="26" cy="22" r="8"/><circle fill="#C75C5C" cx="38" cy="22" r="8"/><circle fill="#C75C5C" cx="32" cy="16" r="8"/><circle fill="#C75C5C" cx="32" cy="28" r="8"/><circle fill="#F5CF87" cx="32" cy="22" r="5"/></svg>' },
  { key: 'graph-chart', name: 'Graph / Chart', description: 'Render interactive charts and graphs', defaultEnabled: true, icon: '<svg width="24" height="24" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path style="fill:#9777A8;" d="M18.306,33.28l-5.013,5.013c-0.391,0.391-0.391,1.023,0,1.414C13.488,39.902,13.744,40,14,40s0.512-0.098,0.707-0.293l5.013-5.013c0.391-0.391,0.391-1.023,0-1.414S18.696,32.89,18.306,33.28z"/><path style="fill:#9777A8;" d="M27.694,33.28c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l6.025,6.025c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414L27.694,33.28z"/><path style="fill:#9777A8;" d="M50.707,30.293c-0.391-0.391-1.023-0.391-1.414,0l-10,10c-0.391,0.391-0.391,1.023,0,1.414C39.488,41.902,39.744,42,40,42s0.512-0.098,0.707-0.293l10-10C51.098,31.316,51.098,30.684,50.707,30.293z"/><path style="fill:#556080;" d="M3,60c-0.553,0-1-0.447-1-1V1c0-0.553,0.447-1,1-1s1,0.447,1,1v58C4,59.553,3.553,60,3,60z"/><path style="fill:#556080;" d="M59,58H1c-0.553,0-1-0.447-1-1s0.447-1,1-1h58c0.553,0,1,0.447,1,1S59.553,58,59,58z"/><circle style="fill:#F29C1F;" cx="11.012" cy="42.988" r="5"/><circle style="fill:#71C285;" cx="23" cy="31" r="5"/><circle style="fill:#71C285;" cx="54" cy="28" r="5"/><circle style="fill:#F29C1F;" cx="36" cy="44" r="5"/></svg>' },
  { key: 'typewriter-macro', name: 'Typewriter', description: 'Animate text with typewriter/chat-style effects', defaultEnabled: true, icon: '<svg width="24" height="24" fill="#000" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M55.89,29.39a4.78,4.78,0,0,0-4.77-4.78H38.19l5.2-5.2h0l6-6.05a3.68,3.68,0,0,0,1.1-2.63,3.74,3.74,0,0,0-6.37-2.64L27.65,24.61H19a4.77,4.77,0,0,0-.82,9.47l-9,9a3.73,3.73,0,0,0,5.27,5.27l3.69-3.69-.76,6.81a5,5,0,0,0,5,5.55H47.74a5,5,0,0,0,5-5.55L50.8,34.16h.32A4.78,4.78,0,0,0,55.89,29.39Z"/></svg>' },
];

export default function App() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((result) => {
      const s = {};
      MACROS.forEach((m) => {
        s[m.key] = result[m.key] !== undefined ? result[m.key] : m.defaultEnabled;
      });
      setSettings(s);
    });
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await invoke('saveSettings', { settings });
    setSaving(false);
    setSaved(true);
  };

  if (!settings) return <div style={{ padding: 24 }}>Loading settings...</div>;

  return (
    <div style={{ padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: 600 }}>
      <h2 style={{ margin: '0 0 4px' }}></h2>
      <p style={{ color: '#6b778c', margin: '0 0 24px', fontSize: 14 }}>Enable or disable individual macros for your site.</p>

      {MACROS.map((macro) => (
        <div key={macro.key} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {macro.icon && <span dangerouslySetInnerHTML={{ __html: macro.icon }} />}
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{macro.name}</div>
                <div style={{ color: '#6b778c', fontSize: 13, marginTop: 2 }}>{macro.description}</div>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings[macro.key]}
                onChange={() => toggle(macro.key)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: settings[macro.key] ? '#0052CC' : '#ccc',
                borderRadius: 12, transition: 'background 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: settings[macro.key] ? 22 : 2,
                  width: 20, height: 20, background: '#fff', borderRadius: '50%',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </span>
            </label>
          </div>
          {macro.warning && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#FFFAE6', border: '1px solid #FFE380', borderRadius: 4, fontSize: 13, lineHeight: 1.4 }}>
              {macro.warning}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '8px 20px', background: '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <span style={{ color: '#36B37E', fontSize: 13 }}>✓ Settings saved</span>}
      </div>
    </div>
  );
}
