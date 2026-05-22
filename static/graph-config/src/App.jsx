import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_TYPES = ['bar', 'line', 'pie', 'doughnut', 'area'];
const COLORS = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9'];

export default function App() {
  const [chartType, setChartType] = useState('bar');
  const [title, setTitle] = useState('');
  const [labels, setLabels] = useState('Jan, Feb, Mar, Apr');
  const [datasets, setDatasets] = useState([{ label: 'Series 1', color: COLORS[0], data: '10, 20, 30, 40' }]);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sliceColors, setSliceColors] = useState(COLORS.slice(0, 4));

  useEffect(() => {
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.chartType) setChartType(c.chartType);
      if (c.title) setTitle(c.title);
      if (c.labels) setLabels(c.labels.join(', '));
      if (c.datasets) setDatasets(c.datasets.map(d => ({ ...d, data: d.data.join(', ') })));
      if (c.showLegend !== undefined) setShowLegend(c.showLegend);
      if (c.showGrid !== undefined) setShowGrid(c.showGrid);
      if (c.sliceColors) setSliceColors(c.sliceColors);
    });
  }, []);

  const addDataset = () => setDatasets([...datasets, { label: `Series ${datasets.length + 1}`, color: COLORS[datasets.length % COLORS.length], data: '' }]);
  const removeDataset = (i) => setDatasets(datasets.filter((_, idx) => idx !== i));
  const updateDataset = (i, key, val) => { const d = [...datasets]; d[i] = { ...d[i], [key]: val }; setDatasets(d); };

  const parsedLabels = labels.split(',').map(s => s.trim()).filter(Boolean);
  const isPie = chartType === 'pie' || chartType === 'doughnut';

  // For pie/doughnut: one dataset, colors per slice. For others: multiple datasets.
  const parsedDatasets = isPie
    ? [{ label: datasets[0]?.label || 'Data', data: datasets[0]?.data.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)) || [], backgroundColor: parsedLabels.map((_, i) => sliceColors[i] || COLORS[i % COLORS.length]), borderColor: '#fff', borderWidth: 2 }]
    : datasets.map(d => ({
        label: d.label,
        data: d.data.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)),
        backgroundColor: d.color + '99',
        borderColor: d.color,
        borderWidth: 2,
        fill: chartType === 'area',
      }));

  const chartData = { labels: parsedLabels, datasets: parsedDatasets };
  const chartOptions = { responsive: true, plugins: { legend: { display: showLegend }, title: { display: !!title, text: title } }, scales: chartType !== 'pie' && chartType !== 'doughnut' ? { x: { grid: { display: showGrid } }, y: { grid: { display: showGrid } } } : undefined };

  const ChartComponent = chartType === 'line' || chartType === 'area' ? Line : chartType === 'pie' ? Pie : chartType === 'doughnut' ? Doughnut : Bar;

  const handleSave = async () => {
    setSaving(true);
    view.submit({
      config: {
        chartType, title, labels: parsedLabels, showLegend, showGrid, sliceColors,
        datasets: datasets.map(d => ({ label: d.label, color: d.color, data: d.data.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)) })),
      },
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Left: Controls */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', borderRight: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Configure Chart</h3>
          <button onClick={() => view.close()} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 500 }}>Chart Type</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {CHART_TYPES.map(t => (
            <button key={t} onClick={() => setChartType(t)} style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: 4, background: chartType === t ? '#0052CC' : '#fff', color: chartType === t ? '#fff' : '#333', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        <label style={{ fontSize: 13, fontWeight: 500 }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Chart title (optional)" style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />

        <label style={{ fontSize: 13, fontWeight: 500 }}>Labels (comma separated)</label>
        <input value={labels} onChange={e => setLabels(e.target.value)} placeholder="Jan, Feb, Mar" style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />

        <label style={{ fontSize: 13, fontWeight: 500 }}>Datasets</label>
        {isPie ? (
          <>
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 10, marginTop: 8 }}>
              <label style={{ fontSize: 12, color: '#6b778c' }}>Values (comma separated, one per label)</label>
              <input value={datasets[0]?.data || ''} onChange={e => updateDataset(0, 'data', e.target.value)} placeholder="10, 20, 30, 40" style={{ width: '100%', padding: 6, fontSize: 13, border: '1px solid #ccc', borderRadius: 4, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <label style={{ fontSize: 13, fontWeight: 500, marginTop: 12, display: 'block' }}>Slice Colors</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {parsedLabels.map((lbl, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="color" value={sliceColors[i] || COLORS[i % COLORS.length]} onChange={e => { const c = [...sliceColors]; c[i] = e.target.value; setSliceColors(c); }} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }} />
                  <span style={{ fontSize: 12 }}>{lbl}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {datasets.map((ds, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: 4, padding: 10, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input value={ds.label} onChange={e => updateDataset(i, 'label', e.target.value)} placeholder="Name" style={{ flex: 1, padding: 6, fontSize: 13, border: '1px solid #ccc', borderRadius: 4 }} />
              <input type="color" value={ds.color} onChange={e => updateDataset(i, 'color', e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
              {datasets.length > 1 && <button onClick={() => removeDataset(i)} style={{ padding: '2px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>✕</button>}
            </div>
            <input value={ds.data} onChange={e => updateDataset(i, 'data', e.target.value)} placeholder="10, 20, 30, 40" style={{ width: '100%', padding: 6, fontSize: 13, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={addDataset} style={{ marginTop: 8, padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12 }}>+ Add dataset</button>
          </>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} /> Legend</label>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> Grid</label>
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: saving ? '#999' : '#0052CC', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }}>{saving ? 'Saving...' : 'Save Chart'}</button>
        </div>
      </div>

      {/* Right: Preview */}
      <div style={{ flex: 1, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <ChartComponent data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
