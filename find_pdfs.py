import time
import requests
from googlesearch import search
import os

conferences = ['PSAC', 'RMAC', 'SSC', 'GLIAC', 'GMAC', 'PCSC', 'NE10', 'SAC']
year = '2026'

for conf in conferences:
    query = f"{year} {conf} swimming championship results filetype:pdf"
    print(f"Searching for {query}...")
    try:
        results = list(search(query, num_results=3))
        found = False
        for url in results:
            if url.endswith('.pdf'):
                print(f"Downloading {url}...")
                try:
                    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                    r.raise_for_status()
                    filename = f"2026_{conf}_Championships.pdf"
                    with open(filename, 'wb') as f:
                        f.write(r.content)
                    print(f"Saved to {filename}")
                    found = True
                    break
                except Exception as e:
                    print(f"Error downloading {url}: {e}")
        if not found:
            print(f"Could not find PDF for {conf}")
    except Exception as e:
        print(f"Search failed for {conf}: {e}")
    time.sleep(2)
