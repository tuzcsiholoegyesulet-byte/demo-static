import glob
import re

html_files = glob.glob('*.html')

search_li = """
        <li class="search-nav-item">
          <a href="#" onclick="document.getElementById('searchModal').showModal(); return false;" aria-label="Keresés">
            <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
          </a>
        </li>
"""

modal_html = """
  <!-- Search Modal -->
  <dialog id="searchModal" class="search-dialog">
    <div class="search-dialog-header">
      <h2>Keresés az oldalon</h2>
      <button class="search-close-btn" onclick="document.getElementById('searchModal').close()" aria-label="Bezárás">
        <svg style="width: 20px; height: 20px; fill: var(--color-dark-blue);" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
      </button>
    </div>
    <div class="search-dialog-body">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
        <input type="text" class="search-input" placeholder="Mit keresel? Írd be ide...">
      </div>
      <div class="search-results-placeholder">
        A keresési találatok itt fognak megjelenni...
      </div>
    </div>
  </dialog>
"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    
    # 1. Insert search icon in nav
    # We look for the closing of the Gyermekvedelem dropdown
    # Use regex to be flexible with whitespace
    pattern = re.compile(r'(<li><a href="gyermekvedelem\.html#podcast">Podcast</a></li>\s*</ul>\s*</li>)', re.DOTALL)
    
    if not re.search(r'<li class="search-nav-item">', content):
        if pattern.search(content):
            content = pattern.sub(r'\1' + '\n' + search_li, content)
            changed = True
        else:
            print(f"Warning: Could not find Gyermekvédelem nav block in {file}")
    
    # 2. Insert modal before </body>
    if 'id="searchModal"' not in content:
        content = content.replace('</body>', modal_html + '\n</body>')
        changed = True
        
    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {file}")

print("Done patching HTML files.")
