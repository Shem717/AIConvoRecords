import fs from 'fs';
import path from 'path';
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

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function main() {
  if (!fs.existsSync(PENDING_DIR)) {
    console.log('No pending directory found.');
    return;
  }

  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.html'));

  if (files.length === 0) {
    console.log('No HTML files found in pending/');
    return;
  }

  let conversations = [];
  if (fs.existsSync(CONVERSATIONS_FILE)) {
    try {
      conversations = JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
    } catch (err) {
      console.error('Error reading conversations.json, starting fresh.', err);
    }
  }

  files.forEach(file => {
    const srcPath = path.join(PENDING_DIR, file);
    const destPath = path.join(PUBLIC_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf8');

    const title = getTitle(content, file);
    const provider = getProvider(file);
    const date = getTodayDate();
    const id = file.replace(/\.html$/, '');

    const newEntry = {
      id,
      filename: file,
      title,
      provider,
      date
    };

    // Remove existing entry with same ID if exists
    conversations = conversations.filter(c => c.id !== id);
    conversations.push(newEntry);

    // Move file
    fs.renameSync(srcPath, destPath);
    console.log(`Processed: ${file} (Provider: ${provider})`);
  });

  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2));
  console.log(`Updated conversations.json with ${files.length} new file(s).`);
}

main();
