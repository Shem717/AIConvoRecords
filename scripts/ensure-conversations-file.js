import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CONVERSATIONS_FILE = path.join(PUBLIC_DIR, 'conversations.json');

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

if (!fs.existsSync(CONVERSATIONS_FILE)) {
  fs.writeFileSync(CONVERSATIONS_FILE, '[]');
  console.log('Created public/conversations.json');
} else {
  console.log('public/conversations.json already exists');
}
