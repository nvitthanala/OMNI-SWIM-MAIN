import json
import subprocess
import sys
import os
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
        print(f"{pdf}: FILE NOT FOUND, skipping")
        continue
    print('\n===', pdf, '===')
    try:
        out = subprocess.check_output([sys.executable, str(PDF_PARSER), path], cwd=BASE, timeout=120000, env=ENV)
        parsed = json.loads(out)
    except subprocess.CalledProcessError as e:
        print('Parser failed:', e)
        continue
    except Exception as e:
        print('Parser JSON load failed:', e)
        continue

    # run calculator
    try:
        proc = subprocess.Popen(
            [sys.executable, str(POINT_CALC)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=BASE,
            text=True,
            env=ENV,
        )
        inp = json.dumps(parsed)
        stdout, stderr = proc.communicate(inp, timeout=120000)
        if proc.returncode != 0:
            print('Calculator failed:', stderr)
            continue
        calc = json.loads(stdout)
    except Exception as e:
        print('Calculator invocation failed:', e)
        continue

    # Aggregate
    men = defaultdict(float)
    women = defaultdict(float)
    for a in calc:
        pts = a.get('calculated_points')
        try:
            val = float(pts) if isinstance(pts, (int, float, str)) and pts!='N/A' else 0.0
        except Exception:
            val = 0.0
        if a.get('gender') == 'Men':
            men[a.get('team','UNKNOWN')] += val
        else:
            women[a.get('team','UNKNOWN')] += val

    print('\nMen totals:')
    for t,p in sorted(men.items(), key=lambda x:-x[1]):
        print(f"  {t}: {p}")
    print('\nWomen totals:')
    for t,p in sorted(women.items(), key=lambda x:-x[1]):
        print(f"  {t}: {p}")
    print('\nCombined totals:')
    combined = defaultdict(float)
    for d in (men,women):
        for t,p in d.items():
            combined[t]+=p
    for t,p in sorted(combined.items(), key=lambda x:-x[1]):
        print(f"  {t}: {p}")

print('\nDone')
