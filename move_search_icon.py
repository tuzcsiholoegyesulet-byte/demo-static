import glob
import re

html_files = glob.glob('*.html')

search_li_block = """
        <li class="search-nav-item">
          <a href="#" onclick="document.getElementById('searchModal').showModal(); return false;" aria-label="Keresés">
            <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
          </a>
        </li>
"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file contains the search item
    if 'class="search-nav-item"' in content:
        # First, remove the existing search block
        # We'll use regex to match the search-nav-item <li> block including newlines
        pattern_remove = re.compile(r'\s*<li class="search-nav-item">.*?</li>', re.DOTALL)
        content_without_search = pattern_remove.sub('', content)
        
        # Then, insert it AFTER the Tamogass minket button
        # The button looks like: <li><a href="hogyan-segithetsz.html#tamogass" class="btn btn-cta">Támogass minket</a></li>
        # Let's match it exactly
        pattern_insert = re.compile(r'(<li><a href="hogyan-segithetsz\.html#tamogass" class="btn btn-cta">Támogass minket</a></li>)')
        
        if pattern_insert.search(content_without_search):
            new_content = pattern_insert.sub(r'\1' + search_li_block, content_without_search)
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Moved search icon in {file}")
        else:
            print(f"Warning: Could not find Támogass minket button in {file}")

print("Done moving search icon.")
