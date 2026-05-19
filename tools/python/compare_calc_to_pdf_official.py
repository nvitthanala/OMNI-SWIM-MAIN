import json, subprocess, sys, os, re
from collections import defaultdict
from pathlib import Path

PDFS = [
    '2026_acc_championship_full_meet_results_1col.pdf',
    '2026_NSISC_Championships_Final_Results.pdf',
    'glvc_results26.pdf',
    'Big_12_S_D_Champ_Results_pdf.pdf'
]

REPO = Path(__file__).resolve().parents[2]
BASE = str(REPO)
PDF_PARSER = REPO / 'backend' / 'pdf_parser.py'
POINT_CALC = REPO / 'backend' / 'point_calculator.py'
ENV = {**os.environ, 'OMNI_PROJECT_ROOT': str(REPO), 'OMNI_DATA_DIR': str(REPO / 'data')}

for pdf in PDFS:
    path = os.path.join(BASE, pdf)
    if not os.path.exists(path):
        continue
    print('\n===', pdf, '===')
    out = subprocess.check_output([sys.executable, str(PDF_PARSER), path], cwd=BASE, timeout=120000, env=ENV)
    parsed = json.loads(out)
    # calc
    proc = subprocess.Popen(
        [sys.executable, str(POINT_CALC)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=BASE,
        text=True,
        env=ENV,
    )
    stdout, stderr = proc.communicate(json.dumps(parsed), timeout=120000)
    calc = json.loads(stdout)
    # aggregate computed totals
    totals = defaultdict(float)
    teams = set()
    for a in calc:
        t = a.get('team','UNKNOWN')
        teams.add(t)
        pts = a.get('calculated_points')
        try:
            val = float(pts) if pts!='N/A' else 0.0
        except:
            val = 0.0
        totals[t]+=val
    # extract text
    import pdfplumber
    text_lines = []
    with pdfplumber.open(path) as pdfobj:
        for page in pdfobj.pages:
            tx = page.extract_text()
            if not tx: continue
            text_lines += [l.strip() for l in tx.split('\n') if l.strip()]
    # try to find official totals by matching team name and trailing number
    found = {}
    for team in teams:
        # try multiple fuzzy patterns
        pattern = re.compile(re.escape(team) + r'.{0,40}?\b(\d{1,5})$')
        for l in text_lines:
            m = pattern.search(l)
            if m:
                found[team]=int(m.group(1))
                break
    # print comparison
    if not found:
        print('No official team totals found in PDF text for teams')
    else:
        print('Team | computed | official')
        for team, comp in sorted(totals.items(), key=lambda x:-x[1]):
            off = found.get(team)
            if off is None:
                print(f"{team[:40]:40} | {comp:8.1f} | (no official found)")
            else:
                print(f"{team[:40]:40} | {comp:8.1f} | {off}")

print('\nDone')
