/**
 * POST /api/parse-pdf with a repo sample PDF (run while `npm run dev` is up).
 * Usage: node scripts/smoke_parse_pdf.mjs [relativePathToPdf]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rel = process.argv[2] || 'glvc_results26.pdf';
const pdfPath = path.join(root, rel);

if (!fs.existsSync(pdfPath)) {
  console.error('PDF not found:', pdfPath);
  process.exit(1);
}

const base64 = fs.readFileSync(pdfPath).toString('base64');
const url = process.env.SMOKE_PARSE_URL || 'http://127.0.0.1:3000/api/parse-pdf';

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ base64, format: 'auto' }),
});

const text = await res.text();
let preview = text;
try {
  const j = JSON.parse(text);
  if (j.results && Array.isArray(j.results)) {
    preview = JSON.stringify({ ok: true, count: j.results.length, sample: j.results.slice(0, 2) }, null, 2);
  } else if (j.error) {
    preview = JSON.stringify({ status: res.status, error: j.error, details: j.details }, null, 2);
  }
} catch {
  preview = text.slice(0, 800);
}

console.log('HTTP', res.status);
console.log(preview);

if (!res.ok) process.exit(1);
