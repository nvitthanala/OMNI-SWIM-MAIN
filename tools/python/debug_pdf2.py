import pdfplumber
import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
os.chdir(REPO)

with pdfplumber.open(REPO / '2026_acc_championship_full_meet_results_1col.pdf') as pdf:
    text = pdf.pages[5].extract_text()
    lines = text.split("\n")
    with open(REPO / 'debug_acc_page6.txt', 'w', encoding='utf-8') as f:
        f.write("=== ACC PAGE 6 (first 60 lines, no layout) ===\n")
        for i, line in enumerate(lines[:60]):
            f.write(f"{i}: [{repr(line)}]\n")

    text = pdf.pages[16].extract_text()
    lines = text.split("\n")
    with open(REPO / 'debug_acc_page17.txt', 'w', encoding='utf-8') as f:
        f.write("=== ACC PAGE 17 (first 60 lines, no layout) ===\n")
        for i, line in enumerate(lines[:60]):
            f.write(f"{i}: [{repr(line)}]\n")

with pdfplumber.open(REPO / '2026_NSISC_Championships_Final_Results.pdf') as pdf:
    text = pdf.pages[7].extract_text()
    lines = text.split("\n")
    with open(REPO / 'debug_nsisc_page8.txt', 'w', encoding='utf-8') as f:
        f.write("=== NSISC PAGE 8 (first 60 lines, no layout) ===\n")
        for i, line in enumerate(lines[:60]):
            f.write(f"{i}: [{repr(line)}]\n")

print("Done")
