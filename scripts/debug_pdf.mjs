import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..');
const win = process.platform === 'win32';
const venvPy = win ? path.join(BASE, 'venv', 'Scripts', 'python.exe') : path.join(BASE, 'venv', 'bin', 'python3');
const pythonCmd = fs.existsSync(venvPy) ? venvPy : win ? 'python' : 'python3';

const nsisc = path.join(BASE, '2026_NSISC_Championships_Final_Results.pdf').replace(/\\/g, '\\\\');
const acc = path.join(BASE, '2026_acc_championship_full_meet_results_1col.pdf').replace(/\\/g, '\\\\');

// Dump first lines from each PDF
const pyScript = `
import pdfplumber

with pdfplumber.open(r'${nsisc}') as pdf:
    text = pdf.pages[0].extract_text(layout=True)
    lines = text.split('\\n')
    print("=== NSISC PAGE 0 (first 50 lines) ===")
    for i, line in enumerate(lines[:50]):
        print(f"{i}: [{repr(line)}]")
    
    text2 = pdf.pages[0].extract_text()
    lines2 = text2.split('\\n')
    print("\\n=== NSISC PAGE 0 NO LAYOUT (first 30 lines) ===")
    for i, line in enumerate(lines2[:30]):
        print(f"{i}: [{repr(line)}]")

with pdfplumber.open(r'${acc}') as pdf:
    text = pdf.pages[0].extract_text(layout=True)
    lines = text.split('\\n')
    print("\\n=== ACC PAGE 0 LAYOUT (first 50 lines) ===")
    for i, line in enumerate(lines[:50]):
        print(f"{i}: [{repr(line)}]")
    
    text2 = pdf.pages[0].extract_text()
    lines2 = text2.split('\\n')
    print("\\n=== ACC PAGE 0 NO LAYOUT (first 30 lines) ===")
    for i, line in enumerate(lines2[:30]):
        print(f"{i}: [{repr(line)}]")
`;

try {
  const result = execSync(
    `"${pythonCmd}" -c "${pyScript.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
    {
      encoding: 'utf8',
      timeout: 30000,
      cwd: BASE,
    },
  );
  console.log(result);
} catch (e) {
  console.error('Error:', e.message);
  console.log('stdout:', e.stdout);
  console.log('stderr:', e.stderr);
}
