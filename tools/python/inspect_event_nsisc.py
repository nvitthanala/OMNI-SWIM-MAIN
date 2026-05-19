import json, subprocess, sys, os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BACKEND = REPO / 'backend'
PDF_PARSER = BACKEND / 'pdf_parser.py'
POINT_CALC = BACKEND / 'point_calculator.py'
ENV = {**os.environ, 'OMNI_PROJECT_ROOT': str(REPO), 'OMNI_DATA_DIR': str(REPO / 'data')}

pdf = '2026_NSISC_Championships_Final_Results.pdf'
path = str(REPO / pdf)

out = subprocess.check_output([sys.executable, str(PDF_PARSER), path], cwd=str(REPO), timeout=120000, env=ENV)
parsed = json.loads(out)
proc = subprocess.Popen(
    [sys.executable, str(POINT_CALC)],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    cwd=str(REPO),
    text=True,
    env=ENV,
)
stdout, stderr = proc.communicate(json.dumps(parsed), timeout=120000)
calc = json.loads(stdout)

# group by event
from collections import defaultdict

events = defaultdict(list)
for a in calc:
    events[a['event']].append(a)

# print first 10 events with details
count = 0
for ev, lst in events.items():
    print('\n=== EVENT:', ev, '===')
    for a in sorted(lst, key=lambda x: (x.get('rank') or 'ZZZ')):
        print(
            f"{a.get('rank'):>4} | {a['name'][:25]:25} | {a['team'][:25]:25} | {a.get('round_swam'):10} | finals:{a.get('finals_time'):8} | exh:{a.get('is_exhibition')} | pts:{a.get('calculated_points')}"
        )
    count += 1
    if count >= 10:
        break
