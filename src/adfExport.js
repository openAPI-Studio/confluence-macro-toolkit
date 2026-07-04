import { storage } from '@forge/api';

// Static ADF representations of each macro. Confluence uses these wherever the
// interactive iframe cannot run: the mobile apps, PDF/Word exports, and other
// native-renderer contexts. Without an adfExport, macros render as nothing there.

// --- Minimal ADF builders (plain JSON, no extra dependency) ---
const doc = (...content) => ({ type: 'doc', version: 1, content });
const p = (...content) => ({ type: 'paragraph', content });
const text = (t) => ({ type: 'text', text: String(t) });
const strong = (t) => ({ type: 'text', text: String(t), marks: [{ type: 'strong' }] });
const em = (t) => ({ type: 'text', text: String(t), marks: [{ type: 'em' }] });
const heading = (level, t) => ({ type: 'heading', attrs: { level }, content: [text(t)] });
const codeBlock = (t, language) => ({
  type: 'codeBlock',
  attrs: language ? { language } : {},
  content: t ? [text(t)] : [],
});
const bulletList = (...items) => ({ type: 'bulletList', content: items });
const listItem = (...content) => ({ type: 'listItem', content });
const panel = (panelType, ...content) => ({ type: 'panel', attrs: { panelType }, content });

const OPEN_ON_DESKTOP = 'Open this page in Confluence on desktop for the interactive version.';

function getConfig(payload) {
  const ext = payload?.context?.extension || payload?.extension || {};
  return ext.config || {};
}

// Wrap every handler so a bad payload/storage read degrades to a labelled
// placeholder instead of a broken export.
function safeExport(name, fn) {
  return async (payload) => {
    try {
      return await fn(payload);
    } catch (e) {
      console.error(`adfExport ${name} failed:`, e.message);
      return doc(p(em(`${name} — ${OPEN_ON_DESKTOP}`)));
    }
  };
}

// --- Poll: render live results from storage ---
export const exportPoll = safeExport('Poll', async (payload) => {
  const config = getConfig(payload);
  if (!config.pollKey) return doc(p(em(`Poll — ${OPEN_ON_DESKTOP}`)));
  const poll = await storage.get(config.pollKey);
  if (!poll || !Array.isArray(poll.options)) return doc(p(em(`Poll — ${OPEN_ON_DESKTOP}`)));

  const votes = poll.votes || {};
  const totalVotes = Object.keys(votes).length;
  const isMulti = poll.pollType === 'multi';
  const counts = poll.options.map((_, i) => {
    if (isMulti) return Object.values(votes).filter((v) => Array.isArray(v) && v.includes(i)).length;
    return Object.values(votes).filter((v) => v === i).length;
  });

  const content = [];
  if (poll.question) content.push(heading(3, poll.question));
  content.push(bulletList(...poll.options.map((opt, i) => {
    const pct = totalVotes > 0 ? Math.round((counts[i] / totalVotes) * 100) : 0;
    return listItem(p(text(`${opt} — ${counts[i]} vote${counts[i] !== 1 ? 's' : ''} (${pct}%)`)));
  })));
  content.push(p(em(`Total: ${totalVotes} vote${totalVotes !== 1 ? 's' : ''}. ${OPEN_ON_DESKTOP}`)));
  return doc(...content);
});

// --- Mood board: title + vote counts from storage ---
export const exportMood = safeExport('Mood board', async (payload) => {
  const config = getConfig(payload);
  if (!config.moodKey) return doc(p(em(`Mood board — ${OPEN_ON_DESKTOP}`)));
  const mood = await storage.get(config.moodKey);
  if (!mood) return doc(p(em(`Mood board — ${OPEN_ON_DESKTOP}`)));

  const content = [];
  if (mood.title) content.push(heading(3, mood.title));
  const entries = Object.entries(mood.votes || {});
  if (entries.length) {
    content.push(bulletList(...entries.map(([value, voters]) =>
      listItem(p(text(`${value} — ${voters.length}`))))));
  }
  content.push(p(em(`Mood board. ${OPEN_ON_DESKTOP}`)));
  return doc(...content);
});

// --- Markdown: show the source ---
export const exportMarkdown = safeExport('Markdown', async (payload) => {
  const config = getConfig(payload);
  if (!config.code) return doc(p(em(`Markdown — ${OPEN_ON_DESKTOP}`)));
  return doc(codeBlock(config.code, 'markdown'));
});

// --- Mermaid: show the diagram source ---
export const exportMermaid = safeExport('Mermaid diagram', async (payload) => {
  const config = getConfig(payload);
  if (!config.code) return doc(p(em(`Mermaid diagram — ${OPEN_ON_DESKTOP}`)));
  return doc(
    codeBlock(config.code),
    p(em(`Mermaid diagram source. ${OPEN_ON_DESKTOP}`))
  );
});

// --- Swagger/OpenAPI: title only, spec can be huge ---
export const exportSwagger = safeExport('API documentation', async (payload) => {
  const config = getConfig(payload);
  let title = '';
  if (config.code) {
    try {
      const parsed = JSON.parse(config.code);
      title = parsed?.info?.title || '';
    } catch {
      const m = config.code.match(/^\s*title:\s*(.+)$/m);
      title = m ? m[1].trim() : '';
    }
  }
  return doc(p(
    strong(title ? `API documentation: ${title}. ` : 'API documentation. '),
    em(OPEN_ON_DESKTOP)
  ));
});

// --- Typewriter: full text, no animation ---
export const exportTypewriter = safeExport('Typewriter', async (payload) => {
  const config = getConfig(payload);
  if (!config.text) return doc(p(em(`Typewriter — ${OPEN_ON_DESKTOP}`)));
  const lines = String(config.text).split('\n').filter((l) => l.length);
  return doc(...(lines.length ? lines.map((l) => p(text(l))) : [p(em(`Typewriter — ${OPEN_ON_DESKTOP}`))]));
});

// --- Sticky note: note panel with the text ---
export const exportSticky = safeExport('Sticky note', async (payload) => {
  const config = getConfig(payload);
  if (!config.text) return doc(p(em(`Sticky note — ${OPEN_ON_DESKTOP}`)));
  const lines = String(config.text).split('\n').filter((l) => l.length);
  return doc(panel('note', ...(lines.length ? lines.map((l) => p(text(l))) : [p(text(' '))])));
});

// --- Spoiler: never reveal the hidden content in a static view ---
export const exportSpoiler = safeExport('Spoiler', async () => {
  return doc(panel('note', p(em(`Spoiler — content hidden. ${OPEN_ON_DESKTOP}`))));
});

// --- Graph: tabulate the first dataset ---
export const exportGraph = safeExport('Chart', async (payload) => {
  const config = getConfig(payload);
  try {
    const labels = typeof config.labels === 'string' ? JSON.parse(config.labels) : config.labels;
    const datasets = typeof config.datasets === 'string' ? JSON.parse(config.datasets) : config.datasets;
    const data = datasets?.[0]?.data;
    if (Array.isArray(labels) && Array.isArray(data) && labels.length) {
      const content = [];
      if (config.title) content.push(heading(3, config.title));
      content.push(bulletList(...labels.map((label, i) =>
        listItem(p(text(`${label}: ${data[i] ?? ''}`))))));
      content.push(p(em(`${config.chartType || 'Chart'} data. ${OPEN_ON_DESKTOP}`)));
      return doc(...content);
    }
  } catch { /* fall through to placeholder */ }
  return doc(p(em(`Chart — ${OPEN_ON_DESKTOP}`)));
});

// --- Clock: list configured clocks ---
export const exportClock = safeExport('Clock', async (payload) => {
  const config = getConfig(payload);
  try {
    const clocks = JSON.parse(config.clocks || '[]');
    if (Array.isArray(clocks) && clocks.length) {
      const names = clocks.map((c) => c.label || c.timezone || 'Local time');
      return doc(p(strong('Clocks: '), text(names.join(', ')), text('. '), em(OPEN_ON_DESKTOP)));
    }
  } catch { /* fall through to placeholder */ }
  return doc(p(em(`Clock — ${OPEN_ON_DESKTOP}`)));
});

// --- Carousel: image count ---
export const exportCarousel = safeExport('Image carousel', async (payload) => {
  const config = getConfig(payload);
  let count = 0;
  try { count = JSON.parse(config.images || '[]').length; } catch { /* placeholder below */ }
  return doc(p(em(count
    ? `Image carousel (${count} image${count !== 1 ? 's' : ''}). ${OPEN_ON_DESKTOP}`
    : `Image carousel — ${OPEN_ON_DESKTOP}`)));
});

// --- Diagrams whose rendered output can't be embedded as static ADF ---
export const exportDrawio = safeExport('Draw.io diagram', async () =>
  doc(p(em(`Draw.io diagram — ${OPEN_ON_DESKTOP}`))));

export const exportPlantuml = safeExport('PlantUML diagram', async (payload) => {
  const config = getConfig(payload);
  if (config.code) {
    return doc(codeBlock(config.code), p(em(`PlantUML source. ${OPEN_ON_DESKTOP}`)));
  }
  return doc(p(em(`PlantUML diagram — ${OPEN_ON_DESKTOP}`)));
});

export const exportExcalidraw = safeExport('Wireframe', async () =>
  doc(p(em(`Wireframe / whiteboard — ${OPEN_ON_DESKTOP}`))));
