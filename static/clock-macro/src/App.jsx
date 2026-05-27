import React, { useEffect, useState, useRef } from 'react';
import { view } from '@forge/bridge';

const getTime = (timezone) => {
  const opts = timezone ? { timeZone: timezone } : {};
  const d = new Date();
  const str = d.toLocaleTimeString('en-US', { ...opts, hour12: false });
  const [h, m, s] = str.split(':').map(Number);
  return { h, m, s, date: d.toLocaleDateString('en-US', { ...opts, weekday: 'short', month: 'short', day: 'numeric' }) };
};

function AnalogClock({ timezone, color, pattern }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const r = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      if (pattern === 'gradient') {
        const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, color + '22');
        ctx.fillStyle = grad;
      } else if (pattern === 'dark') {
        ctx.fillStyle = '#1a1a2e';
      } else if (pattern === 'neon') {
        ctx.fillStyle = '#0d0d0d';
      } else if (pattern === 'minimal') {
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = '#fff';
      }
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = pattern === 'neon' ? 3 : 2;
      ctx.stroke();

      const textColor = (pattern === 'dark' || pattern === 'neon') ? '#fff' : '#333';
      const tickColor = (pattern === 'dark' || pattern === 'neon') ? color : '#333';

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const len = i % 3 === 0 ? 10 : 5;
        ctx.beginPath();
        ctx.moveTo(r + (r - 12) * Math.cos(angle), r + (r - 12) * Math.sin(angle));
        ctx.lineTo(r + (r - 12 - len) * Math.cos(angle), r + (r - 12 - len) * Math.sin(angle));
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = i % 3 === 0 ? 2.5 : 1;
        ctx.stroke();
      }

      const { h, m, s } = getTime(timezone);

      // Hour hand
      const hAngle = ((h % 12) + m / 60) * (Math.PI / 6) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.lineTo(r + (r * 0.5) * Math.cos(hAngle), r + (r * 0.5) * Math.sin(hAngle));
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Minute hand
      const mAngle = (m + s / 60) * (Math.PI / 30) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.lineTo(r + (r * 0.7) * Math.cos(mAngle), r + (r * 0.7) * Math.sin(mAngle));
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Second hand
      const sAngle = s * (Math.PI / 30) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.lineTo(r + (r * 0.75) * Math.cos(sAngle), r + (r * 0.75) * Math.sin(sAngle));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(r, r, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    draw();
    const id = setInterval(draw, 1000);
    return () => clearInterval(id);
  }, [timezone, color, pattern]);

  return <canvas ref={canvasRef} width={140} height={140} style={{ display: 'block' }} />;
}

function DigitalClock({ timezone, color, pattern }) {
  const [time, setTime] = useState(getTime(timezone));

  useEffect(() => {
    const id = setInterval(() => setTime(getTime(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  const bg = pattern === 'dark' ? '#1a1a2e' : pattern === 'neon' ? '#0d0d0d' : pattern === 'gradient' ? `linear-gradient(135deg, ${color}11, ${color}33)` : '#fff';
  const textColor = (pattern === 'dark' || pattern === 'neon') ? color : '#172B4D';
  const border = pattern === 'minimal' ? 'none' : `2px solid ${color}`;
  const shadow = pattern === 'neon' ? `0 0 10px ${color}66, inset 0 0 10px ${color}22` : 'none';

  return (
    <div style={{ padding: '12px 18px', borderRadius: 8, background: bg, border, boxShadow: shadow, textAlign: 'center', minWidth: 120 }}>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Courier New', monospace", color: textColor, textShadow: pattern === 'neon' ? `0 0 8px ${color}` : 'none' }}>
        {String(time.h).padStart(2, '0')}:{String(time.m).padStart(2, '0')}:{String(time.s).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 11, color: (pattern === 'dark' || pattern === 'neon') ? '#aaa' : '#6b778c', marginTop: 4 }}>{time.date}</div>
    </div>
  );
}

export default function App() {
  const [clocks, setClocks] = useState(null);
  const [alignment, setAlignment] = useState('center');

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.clocks) {
        try { setClocks(JSON.parse(c.clocks)); } catch { setClocks([{ type: 'analog', timezone: '', color: '#0052CC', pattern: 'solid', label: '' }]); }
      } else {
        setClocks([{ type: 'analog', timezone: '', color: '#0052CC', pattern: 'solid', label: '' }]);
      }
      if (c.alignment) setAlignment(c.alignment);
    });
  }, []);

  if (!clocks) return null;

  const justify = alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center';

  return (
    <div style={{ display: 'flex', justifyContent: justify, gap: 24, flexWrap: 'wrap', padding: 12 }}>
      {clocks.map((clock, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {clock.type === 'analog'
            ? <AnalogClock timezone={clock.timezone} color={clock.color} pattern={clock.pattern} />
            : <DigitalClock timezone={clock.timezone} color={clock.color} pattern={clock.pattern} />
          }
          {clock.label && <div style={{ fontSize: 12, color: '#6b778c', fontWeight: 500 }}>{clock.label}</div>}
        </div>
      ))}
    </div>
  );
}
