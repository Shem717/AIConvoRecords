import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PENDING_DIR = path.join(__dirname, '..', 'pending');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CONVERSATIONS_FILE = path.join(PUBLIC_DIR, 'conversations.json');

const PROVIDERS = ['claude', 'chatgpt', 'gemini', 'abacus'];

function getTitle(content, filename) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : filename.replace(/\.html$/, '');
}

function getProvider(filename) {
  const lowerName = filename.toLowerCase();
  for (const provider of PROVIDERS) {
    if (lowerName.includes(provider)) {
      return provider;
    }
  }
  return 'unknown';
}

function getNowIso() {
  return new Date().toISOString();
}

function getHashFromBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function loadConversations() {
  if (!fs.existsSync(CONVERSATIONS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading conversations.json, starting fresh.', err);
    return [];
  }
}

function writeConversations(conversations) {
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2));
}

function buildPublicHashIndex() {
  const index = new Map(); // hash -> filename
  const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const fullPath = path.join(PUBLIC_DIR, file);
    const content = fs.readFileSync(fullPath);
    const hash = getHashFromBuffer(content);
    index.set(hash, file);
  }
  return index;
}

function sanitizeFilename(file) {
  return file.replace(/[\\/]/g, '_');
}

function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  if (!fs.existsSync(PENDING_DIR)) {
    console.log('No pending directory found.');
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      fs.writeFileSync(CONVERSATIONS_FILE, '[]');
    }
    return;
  }

  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.html'));

  if (files.length === 0) {
    console.log('No HTML files found in pending/');
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      fs.writeFileSync(CONVERSATIONS_FILE, '[]');
    }
    return;
  }

  let conversations = loadConversations();
  const publicHashIndex = buildPublicHashIndex();

  let processed = 0;
  let deduped = 0;

  files.forEach(file => {
    const safeFilename = sanitizeFilename(file);
    const srcPath = path.join(PENDING_DIR, file);
    const pendingBuffer = fs.readFileSync(srcPath);
    const pendingText = pendingBuffer.toString('utf8');
    const pendingHash = getHashFromBuffer(pendingBuffer);

    const title = getTitle(pendingText, file);
    const provider = getProvider(file);
    const id = safeFilename.replace(/\.html$/, '');

    const existingPublicFilename = publicHashIndex.get(pendingHash);

    let deployedFilename = safeFilename;
    if (existingPublicFilename) {
      // Content already exists in public; avoid duplicate files.
      deployedFilename = existingPublicFilename;
      fs.unlinkSync(srcPath);
      deduped += 1;
      console.log(`Deduped pending file by hash: ${file} -> ${existingPublicFilename}`);
    } else {
      const destPath = path.join(PUBLIC_DIR, safeFilename);
      fs.renameSync(srcPath, destPath);
      publicHashIndex.set(pendingHash, safeFilename);
      console.log(`Processed: ${file} (Provider: ${provider})`);
    }

    const now = getNowIso();
    const newEntry = {
      id,
      filename: deployedFilename,
      title,
      provider,
      date: now,
      lastImportedAt: now,
      contentHash: pendingHash,
      htmlPath: `/${deployedFilename}`
    };

    // Replace by ID to keep one canonical record per ID.
    conversations = conversations.filter(c => c.id !== id);
    conversations.push(newEntry);

    processed += 1;
  });

  // Keep deterministic order for cleaner diffs.
  conversations.sort((a, b) => a.id.localeCompare(b.id));

  writeConversations(conversations);
  console.log(`Updated conversations.json with ${processed} file(s).`);
  if (deduped > 0) {
    console.log(`Deduped ${deduped} pending file(s) against public by content hash.`);
  }
}

main();
