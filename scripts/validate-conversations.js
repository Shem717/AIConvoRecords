import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PENDING_DIR = path.join(ROOT, 'pending');
const CONVERSATIONS_FILE = path.join(PUBLIC_DIR, 'conversations.json');

const hashFile = (fullPath) => {
  const buf = fs.readFileSync(fullPath);
  return crypto.createHash('sha256').update(buf).digest('hex');
};

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
};

const warn = (message) => {
  console.warn(`⚠️  ${message}`);
};

const info = (message) => {
  console.log(`ℹ️  ${message}`);
};

function main() {
  if (!fs.existsSync(CONVERSATIONS_FILE)) {
    fail('public/conversations.json is missing.');
    return;
  }

  let conversations = [];
  try {
    conversations = JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
  } catch (err) {
    fail(`public/conversations.json is invalid JSON: ${err.message}`);
    return;
  }

  const publicHtmlFiles = fs.existsSync(PUBLIC_DIR)
    ? fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'))
    : [];

  const pendingHtmlFiles = fs.existsSync(PENDING_DIR)
    ? fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.html'))
    : [];

  const idSeen = new Set();
  const missingFiles = [];

  for (const c of conversations) {
    if (!c.id) {
      fail(`Conversation entry missing id: ${JSON.stringify(c)}`);
      continue;
    }

    if (idSeen.has(c.id)) {
      fail(`Duplicate conversation id found: ${c.id}`);
    }
    idSeen.add(c.id);

    const filename = c.filename || (c.htmlPath ? c.htmlPath.replace(/^\//, '') : null);
    if (!filename) {
      fail(`Conversation ${c.id} missing filename/htmlPath.`);
      continue;
    }

    const fullPath = path.join(PUBLIC_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push({ id: c.id, filename });
    }
  }

  if (missingFiles.length) {
    missingFiles.forEach(({ id, filename }) => fail(`Indexed file missing in public/: ${filename} (id: ${id})`));
  }

  const indexedFilenames = new Set(
    conversations
      .map(c => c.filename || (c.htmlPath ? c.htmlPath.replace(/^\//, '') : null))
      .filter(Boolean)
  );

  const orphanPublic = publicHtmlFiles.filter(f => !indexedFilenames.has(f));
  if (orphanPublic.length) {
    warn(`Orphan public HTML files not present in conversations.json: ${orphanPublic.join(', ')}`);
  }

  // Duplicate hashes in public
  const publicHashMap = new Map(); // hash -> [file]
  for (const f of publicHtmlFiles) {
    const hash = hashFile(path.join(PUBLIC_DIR, f));
    if (!publicHashMap.has(hash)) publicHashMap.set(hash, []);
    publicHashMap.get(hash).push(f);
  }

  const publicDupGroups = [...publicHashMap.values()].filter(group => group.length > 1);
  if (publicDupGroups.length) {
    publicDupGroups.forEach(group => fail(`Duplicate content in public/: ${group.join(' | ')}`));
  }

  // Pending/public hash collisions (intake duplicates)
  if (pendingHtmlFiles.length > 0) {
    const publicHashes = new Set(publicHashMap.keys());
    for (const p of pendingHtmlFiles) {
      const pHash = hashFile(path.join(PENDING_DIR, p));
      if (publicHashes.has(pHash)) {
        warn(`Pending file duplicates existing public content by hash: ${p}`);
      }
    }
  }

  info(`Conversations indexed: ${conversations.length}`);
  info(`public/*.html files: ${publicHtmlFiles.length}`);
  info(`pending/*.html files: ${pendingHtmlFiles.length}`);

  if (process.exitCode && process.exitCode !== 0) {
    console.error('Validation failed.');
    return;
  }

  console.log('✅ Validation passed.');
}

main();
