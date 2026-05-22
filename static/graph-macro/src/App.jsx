import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['graph-chart'] === false) setDisabled(true); });
    view.getContext().then((ctx) => {
      const c = ctx.extension.config || {};
      if (c.chartType && c.labels && c.datasets) setConfig(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading chart...</div>;
  if (disabled) return <p style={{ color: '#6b778c', padding: 16 }}>This macro has been disabled by your site administrator.</p>;
  if (!config) return <p style={{ color: '#6b778c', padding: 16 }}>No chart configured. Edit this macro to add data.</p>;

  const { chartType, title, labels, datasets, showLegend, showGrid, sliceColors } = config;

  const isPie = chartType === 'pie' || chartType === 'doughnut';
  const COLORS = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9'];

  const chartData = {
    labels,
    datasets: isPie
      ? [{ label: datasets[0]?.label || 'Data', data: datasets[0]?.data || [], backgroundColor: labels.map((_, i) => (sliceColors && sliceColors[i]) || COLORS[i % COLORS.length]), borderColor: '#fff', borderWidth: 2 }]
      : datasets.map(d => ({
          label: d.label,
          data: d.data,
          backgroundColor: d.color + '99',
          borderColor: d.color,
          borderWidth: 2,
          fill: chartType === 'area',
        })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: showLegend }, title: { display: !!title, text: title } },
    scales: chartType !== 'pie' && chartType !== 'doughnut' ? { x: { grid: { display: showGrid } }, y: { grid: { display: showGrid } } } : undefined,
  };

  const ChartComponent = chartType === 'line' || chartType === 'area' ? Line : chartType === 'pie' ? Pie : chartType === 'doughnut' ? Doughnut : Bar;

  return (
    <div style={{ padding: 16, width: '100%' }}>
      <ChartComponent data={chartData} options={chartOptions} />
    </div>
  );
}
