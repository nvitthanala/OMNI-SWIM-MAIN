import time
import requests
from googlesearch import search
import os

conferences = ['PSAC', 'RMAC', 'SSC', 'GLIAC', 'GMAC', 'PCSC', 'NE10', 'SAC']
year = '2026'

for conf in conferences:
    query = f"{year} {conf} swimming championship results pdf"
    print(f"Searching for {query}...")
    try:
        # get 10 results to have a better chance
        results = list(search(query, num_results=10))
        found = False
        for url in results:
            if '.pdf' in url:
                print(f"Downloading {url}...")
                try:
                    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                    if r.status_code == 200:
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
