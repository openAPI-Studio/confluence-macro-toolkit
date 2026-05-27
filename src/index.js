import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';

// PERF-01: Move require to top level
const zlib = require('zlib');

const resolver = new Resolver();

const SETTINGS_KEY = 'macro-settings';
const DEFAULT_SETTINGS = {
  'mermaid-diagram': true,
  'markdown-renderer': true,
  'swagger-api-docs': true,
  'drawio-diagram': false,
  'poll-vote': true,
  'mood-macro': true,
  'graph-chart': true,
  'typewriter-macro': true,
  'plantuml-macro': false,
  'excalidraw-wireframe': false,
  'sticky-note': true,
};

resolver.define('getSettings', async () => {
  try {
    const settings = await storage.get(SETTINGS_KEY);
    return settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

resolver.define('saveSettings', async (req) => {
  try {
    const { settings } = req.payload;
    if (!settings || typeof settings !== 'object') return { success: false };
    await storage.set(SETTINGS_KEY, settings);
    return { success: true };
  } catch {
    return { success: false };
  }
});

// COST-01: Shared voter name resolution (SEC-10: use asUser instead of asApp)
async function resolveVoterNames(votes) {
  const voterNames = {};
  for (const userId of Object.keys(votes || {})) {
    try {
      const res = await api.asUser().requestConfluence(route`/wiki/rest/api/user?accountId=${userId}`, { method: 'GET' });
      const user = await res.json();
      voterNames[userId] = user.displayName || user.publicName || userId.slice(0, 8);
    } catch {
      voterNames[userId] = userId.slice(0, 8);
    }
  }
  return voterNames;
}

// SEC-04: Input validation helpers
function validateString(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.slice(0, maxLen);
}

function validateArray(val, maxItems = 20, maxItemLen = 200) {
  if (!Array.isArray(val)) return [];
  return val.slice(0, maxItems).map(item => typeof item === 'string' ? item.slice(0, maxItemLen) : '');
}

// Poll functions
resolver.define('savePoll', async (req) => {
  const { contentId, macroId, question, options, pollType, allowRevoke, emojis, alignment } = req.payload;
  const pollKey = `poll-${validateString(contentId, 50)}-${validateString(macroId, 50)}`;
  const existing = await storage.get(pollKey);
  await storage.set(pollKey, {
    question: validateString(question, 500),
    options: validateArray(options, 20, 200),
    pollType: ['single', 'multi', 'thumbs', 'emoji'].includes(pollType) ? pollType : 'single',
    allowRevoke: !!allowRevoke,
    alignment: ['left', 'center', 'right'].includes(alignment) ? alignment : 'left',
    emojis: emojis ? validateArray(emojis, 10, 4) : undefined,
    votes: existing?.votes || {},
  });
  return { pollKey };
});

resolver.define('getPoll', async (req) => {
  const { pollKey } = req.payload;
  if (!pollKey) return {};
  const poll = await storage.get(pollKey);
  if (!poll) return {};
  const accountId = req.context.accountId;
  const voterNames = await resolveVoterNames(poll.votes);
  return { ...poll, voterNames, myVote: poll.votes?.[accountId] ?? null };
});

resolver.define('castVote', async (req) => {
  const { pollKey, optionIndex } = req.payload;
  const accountId = req.context.accountId;
  const poll = await storage.get(pollKey);
  if (!poll) return {};
  poll.votes = poll.votes || {};
  poll.votes[accountId] = optionIndex;
  await storage.set(pollKey, poll);
  const voterNames = await resolveVoterNames(poll.votes);
  return { ...poll, voterNames, myVote: optionIndex };
});

resolver.define('revokeVote', async (req) => {
  const { pollKey } = req.payload;
  const accountId = req.context.accountId;
  const poll = await storage.get(pollKey);
  if (!poll) return {};
  if (!poll.allowRevoke && poll.pollType !== 'thumbs' && poll.pollType !== 'emoji') return { ...poll, myVote: poll.votes?.[accountId] ?? null };
  poll.votes = poll.votes || {};
  delete poll.votes[accountId];
  await storage.set(pollKey, poll);
  const voterNames = await resolveVoterNames(poll.votes);
  return { ...poll, voterNames, myVote: null };
});

resolver.define('getConfig', (req) => {
  return req.context.extension.config || {};
});

// Save diagram - store SVG in Forge storage for fast retrieval, XML as attachment for versioning
resolver.define('saveDiagram', async (req) => {
  const { contentId, xml, svg, macroId } = req.payload;
  const storageKey = `drawio-${contentId}-${macroId || 'default'}`;

  // Store SVG in Forge storage for fast rendering
  await storage.set(`${storageKey}-svg`, svg);
  await storage.set(`${storageKey}-xml`, xml);

  // Also save as page attachment for version history
  let attachmentId = '';
  try {
    attachmentId = await saveAttachment(contentId, `drawio-${macroId || 'default'}.xml`, xml);
  } catch (e) {
    console.error('Attachment save failed:', e);
  }

  return { storageKey, attachmentId };
});

// Load diagram SVG from Forge storage
resolver.define('loadSvg', async (req) => {
  const { storageKey } = req.payload;
  if (!storageKey) return { svg: '' };
  const svg = await storage.get(`${storageKey}-svg`);
  return { svg: svg || '' };
});

// Load diagram XML from Forge storage
resolver.define('loadDiagram', async (req) => {
  const { storageKey } = req.payload;
  if (!storageKey) return { xml: '' };
  const xml = await storage.get(`${storageKey}-xml`);
  return { xml: xml || '' };
});

// Mood functions
resolver.define('saveMood', async (req) => {
  const { contentId, macroId, moodType, emojis, title } = req.payload;
  const moodKey = `mood-${contentId}-${macroId}`;
  const existing = await storage.get(moodKey);
  await storage.set(moodKey, {
    moodType, emojis, title,
    votes: existing?.votes || {},
  });
  return { moodKey };
});

resolver.define('getMood', async (req) => {
  const { moodKey } = req.payload;
  if (!moodKey) return {};
  const mood = await storage.get(moodKey);
  if (!mood) return {};
  const accountId = req.context.accountId;
  // Find user's current vote
  let myVote = null;
  for (const [value, voters] of Object.entries(mood.votes || {})) {
    if (voters.includes(accountId)) { myVote = value; break; }
  }
  return { ...mood, myVote };
});

resolver.define('castMoodVote', async (req) => {
  const { moodKey, value } = req.payload;
  const accountId = req.context.accountId;
  const mood = await storage.get(moodKey);
  if (!mood) return {};
  mood.votes = mood.votes || {};
  // Remove previous vote
  for (const [k, voters] of Object.entries(mood.votes)) {
    mood.votes[k] = voters.filter((id) => id !== accountId);
    if (mood.votes[k].length === 0) delete mood.votes[k];
  }
  // Add new vote
  if (!mood.votes[value]) mood.votes[value] = [];
  mood.votes[value].push(accountId);
  await storage.set(moodKey, mood);
  return { ...mood, myVote: value };
});

// PlantUML rendering via public server
resolver.define('renderPlantUml', async (req) => {
  const { code } = req.payload;
  if (!code?.trim()) return { svg: '', error: 'No code provided' };
  try {
    // PlantUML server accepts encoded text and returns SVG
    const encoded = plantumlEncode(code);
    const response = await api.fetch(`https://www.plantuml.com/plantuml/svg/~1${encoded}`, { method: 'GET' });
    if (response.status !== 200) return { svg: '', error: `Server returned ${response.status}` };
    const svg = await response.text();
    if (svg.includes('<svg')) return { svg };
    return { svg: '', error: 'Invalid response from PlantUML server' };
  } catch (e) {
    return { svg: '', error: e.message };
  }
});

// PlantUML text encoding (deflate + custom base64)
function plantumlEncode(text) {
  const deflated = zlib.deflateSync(Buffer.from(text, 'utf-8'), { level: 9 });
  return encode64(deflated);
}

function encode64(data) {
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data[i], data[i + 1], 0);
    } else if (i + 1 === data.length) {
      r += append3bytes(data[i], 0, 0);
    } else {
      r += append3bytes(data[i], data[i + 1], data[i + 2]);
    }
  }
  return r;
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return encode6bit(c1 & 0x3F) + encode6bit(c2 & 0x3F) + encode6bit(c3 & 0x3F) + encode6bit(c4 & 0x3F);
}

function encode6bit(b) {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

// Excalidraw shared library - chunked storage (200KB per key limit)
const LIB_META_KEY = 'excalidraw-shared-library-meta';
const LIB_CHUNK_PREFIX = 'excalidraw-lib-chunk-';
const CHUNK_SIZE = 190000; // ~190KB to stay safely under 200KB limit

resolver.define('saveSharedLibrary', async (req) => {
  const { libraryItems } = req.payload;
  // Clear old chunks
  const oldMeta = await storage.get(LIB_META_KEY);
  if (oldMeta?.chunks) {
    for (let i = 0; i < oldMeta.chunks; i++) {
      await storage.delete(`${LIB_CHUNK_PREFIX}${i}`);
    }
  }
  if (!libraryItems?.length) {
    await storage.set(LIB_META_KEY, { chunks: 0, totalItems: 0 });
    return { success: true };
  }
  // Split into chunks
  const json = JSON.stringify(libraryItems);
  const chunkCount = Math.ceil(json.length / CHUNK_SIZE);
  for (let i = 0; i < chunkCount; i++) {
    await storage.set(`${LIB_CHUNK_PREFIX}${i}`, json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }
  await storage.set(LIB_META_KEY, { chunks: chunkCount, totalItems: libraryItems.length });
  return { success: true };
});

resolver.define('getSharedLibrary', async () => {
  const meta = await storage.get(LIB_META_KEY);
  if (!meta?.chunks) return { libraryItems: [] };
  let json = '';
  for (let i = 0; i < meta.chunks; i++) {
    const chunk = await storage.get(`${LIB_CHUNK_PREFIX}${i}`);
    json += chunk || '';
  }
  try {
    return { libraryItems: JSON.parse(json) };
  } catch {
    return { libraryItems: [] };
  }
});

// Carousel functions
resolver.define('uploadImage', async (req) => {
  const { contentId, filename, dataUrl } = req.payload;
  try {
    console.log('uploadImage called:', { contentId, filename, dataUrlLength: dataUrl?.length });
    const base64 = dataUrl.split(',')[1];
    const mimeMatch = dataUrl.match(/data:([^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    // Add timestamp to avoid duplicate filename errors
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const name = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
    const uniqueFilename = `${name}-${Date.now()}${ext}`;

    const boundary = '----FormBoundary' + Date.now();
    const body = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${uniqueFilename}"`,
      `Content-Type: ${mime}`,
      `Content-Transfer-Encoding: base64`,
      '',
      base64,
      `--${boundary}--`,
    ].join('\r\n');

    console.log('Sending attachment request, body length:', body.length);
    const response = await api.asUser().requestConfluence(
      route`/wiki/rest/api/content/${contentId}/child/attachment`,
      { method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'X-Atlassian-Token': 'nocheck' }, body }
    );
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Upload response:', JSON.stringify(data).slice(0, 500));
    const att = data.results?.[0] || data;
    const baseUrl = att._links?.base || data._links?.base || '';
    const download = att._links?.download || '';
    console.log('Parsed attachment:', { id: att.id, baseUrl, download });
    return { id: att.id || '', url: download ? `${baseUrl}${download}` : '' };
  } catch (e) {
    console.error('Upload error:', e.message, e.stack);
    return { id: '', url: '', error: e.message };
  }
});

// List existing image attachments on the page
resolver.define('listPageImages', async (req) => {
  const { contentId } = req.payload;
  console.log('listPageImages called with contentId:', contentId);
  try {
    const response = await api.asUser().requestConfluence(
      route`/wiki/rest/api/content/${contentId}/child/attachment?limit=50`,
      { method: 'GET' }
    );
    console.log('listPageImages status:', response.status);
    const data = await response.json();
    console.log('listPageImages total results:', data.results?.length);
    const base = data._links?.base || '';
    const images = (data.results || [])
      .filter((att) => att.extensions?.mediaType?.startsWith('image/') || att.title?.match(/\.(png|jpe?g|gif|svg|webp|avif|bmp)$/i))
      .map((att) => ({
        id: att.id,
        name: att.title,
        url: `${base}${att._links?.download || ''}`,
      }));
    console.log('listPageImages filtered:', images.length);
    return { images };
  } catch (e) {
    console.error('listPageImages error:', e.message, e.stack);
    return { images: [] };
  }
});

resolver.define('getImageUrls', async (req) => {
  const { attachmentIds, contentId } = req.payload;
  if (!attachmentIds || !attachmentIds.length) return { images: [] };

  try {
    const pageId = contentId || req.context.extension?.content?.id;
    if (!pageId) return { images: attachmentIds.map(id => ({ id, url: '', name: id })) };

    const allRes = await api.asUser().requestConfluence(
      route`/wiki/rest/api/content/${pageId}/child/attachment?limit=50`,
      { method: 'GET' }
    );
    const allData = await allRes.json();
    const base = allData._links?.base || '';

    const images = attachmentIds.map(id => {
      const att = (allData.results || []).find(a => a.id === id);
      if (att) {
        return { id, url: `${base}${att._links?.download || ''}`, name: att.title || id };
      }
      return { id, url: '', name: id };
    });

    return { images };
  } catch (e) {
    console.error('getImageUrls error:', e.message);
    return { images: attachmentIds.map(id => ({ id, url: '', name: id })) };
  }
});

async function saveAttachment(contentId, filename, content) {
  const boundary = '----FormBoundary' + Date.now();
  const body = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    'Content-Type: application/xml',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n');

  const response = await api.asUser().requestConfluence(
    route`/wiki/rest/api/content/${contentId}/child/attachment`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Atlassian-Token': 'nocheck',
      },
      body,
    }
  );

  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].id;
  }
  return data.id || '';
}

export const handler = resolver.getDefinitions();
