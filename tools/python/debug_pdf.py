import pdfplumber
import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
os.chdir(REPO)

with pdfplumber.open(REPO / '2026_NSISC_Championships_Final_Results.pdf') as pdf:
    text = pdf.pages[0].extract_text(layout=True)
    lines = text.split("\n")
    with open(REPO / 'debug_nsisc.txt', 'w', encoding='utf-8') as f:
        f.write("=== NSISC PAGE 0 LAYOUT (first 50 lines) ===\n")
        for i, line in enumerate(lines[:50]):
            f.write(f"{i}: [{repr(line)}]\n")

    text2 = pdf.pages[0].extract_text()
    lines2 = text2.split("\n")
    with open(REPO / 'debug_nsisc.txt', 'a', encoding='utf-8') as f:
        f.write("\n=== NSISC PAGE 0 NO LAYOUT (first 30 lines) ===\n")
        for i, line in enumerate(lines2[:30]):
            f.write(f"{i}: [{repr(line)}]\n")

with pdfplumber.open(REPO / '2026_acc_championship_full_meet_results_1col.pdf') as pdf:
    text = pdf.pages[0].extract_text(layout=True)
    lines = text.split("\n")
    with open(REPO / 'debug_acc.txt', 'w', encoding='utf-8') as f:
        f.write("=== ACC PAGE 0 LAYOUT (first 50 lines) ===\n")
        for i, line in enumerate(lines[:50]):
            f.write(f"{i}: [{repr(line)}]\n")

    text2 = pdf.pages[0].extract_text()
    lines2 = text2.split("\n")
    with open(REPO / 'debug_acc.txt', 'a', encoding='utf-8') as f:
        f.write("\n=== ACC PAGE 0 NO LAYOUT (first 30 lines) ===\n")
        for i, line in enumerate(lines2[:30]):
            f.write(f"{i}: [{repr(line)}]\n")

print("Done writing debug files")
