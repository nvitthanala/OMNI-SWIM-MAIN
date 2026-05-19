import pdfplumber
import os
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
os.chdir(REPO)

YEAR_PATTERN = r'\b(FR|SO|JR|SR|5Y|FY|GS|GR)\b'

with pdfplumber.open(REPO / 'glvc_results26.pdf') as pdf:
    for pg in range(min(10, len(pdf.pages))):
        text = pdf.pages[pg].extract_text(layout=True)
        lines = text.split("\n")
        has_year = any(re.search(YEAR_PATTERN, l) for l in lines)
        if has_year:
            print(f"\n=== Page {pg} (layout=True, first 40 lines with year markers) ===")
            count = 0
            for line in lines:
                if re.search(YEAR_PATTERN, line) or re.match(r'^\d+\s+[A-Z]', line):
                    print(f"  [{repr(line.strip())}]")
                    count += 1
                    if count >= 25:
                        break

    print("\n\n=== Page with individual events (no layout) ===")
    for pg in range(3, min(8, len(pdf.pages))):
        text = pdf.pages[pg].extract_text()
        lines = text.split("\n")
        has_yr = any(re.search(YEAR_PATTERN, l) for l in lines[:30])
        if has_yr:
            print(f"\n--- Page {pg} no-layout (first 25 lines) ---")
            for line in lines[:25]:
                print(f"  [{repr(line.strip())}]")
            break

print("\nTotal pages:", len(pdf.pages))
