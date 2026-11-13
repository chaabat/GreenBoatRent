// Reads .env (and real environment variables) → writes src/environments/environment.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const REQUIRED = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

// 1. Load .env (if present)
const env = {};
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// 2. Real environment variables win (Docker, CI, hosting)
for (const k of REQUIRED) if (process.env[k]) env[k] = process.env[k];

// 3. Check
const missing = REQUIRED.filter(k => !env[k] || env[k].startsWith('PASTE'));
if (missing.length) {
  console.error(`\n❌ Missing in .env: ${missing.join(', ')}\n`);
  process.exit(1);
}

// 4. Write environment.ts
mkdirSync('src/environments', { recursive: true });
writeFileSync('src/environments/environment.ts',
`// ⚠️ AUTO-GENERATED from .env by scripts/set-env.mjs – do not edit, do not commit
export const environment = {
  firebase: {
    apiKey: '${env.FIREBASE_API_KEY}',
    authDomain: '${env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${env.FIREBASE_PROJECT_ID}',
    storageBucket: '${env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${env.FIREBASE_APP_ID}'
  }
};
`);
console.log('✅ src/environments/environment.ts generated from .env');