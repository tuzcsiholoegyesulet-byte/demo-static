import glob
import re

html_files = glob.glob('*.html')

old_nav_block = """        <li class="search-nav-item">
          <a href="#" onclick="document.getElementById('searchModal').showModal(); return false;" aria-label="Keresés">
            <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
          </a>
        </li>"""

new_nav_block = """        <li class="search-nav-item">
          <div class="search-nav-group">
            <a href="#" onclick="openSearchModal('search'); return false;" class="search-nav-btn" aria-label="Keresés">
              <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            </a>
            <a href="#" onclick="openSearchModal('gemini'); return false;" class="search-nav-btn gemini-btn" aria-label="AI Csevegés">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 4.39999L14.7 7.29999L11.8 8.59999L14.7 9.89999L16 12.8L17.3 9.89999L20.2 8.59999L17.3 7.29999L16 4.39999ZM8.24996 6.89999L6.11996 11.6L1.39996 13.7L6.11996 15.8L8.24996 20.5L10.38 15.8L15.1 13.7L10.38 11.6L8.24996 6.89999Z"/></svg>
            </a>
          </div>
        </li>"""

# We'll use regex to match the old modal and replace it
new_modal = """  <!-- Search & AI Modal -->
  <dialog id="searchModal" class="search-dialog">
    <div class="search-dialog-header">
      <h2 id="modalTitle">Keresés az oldalon</h2>
      <button class="search-close-btn" onclick="document.getElementById('searchModal').close()" aria-label="Bezárás">
        <svg style="width: 20px; height: 20px; fill: var(--color-dark-blue);" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
      </button>
    </div>
    <div class="search-dialog-body">
      <div class="modal-toggle-wrapper">
        <div class="modal-toggle" id="modalToggleGroup">
          <div class="modal-toggle-slider" id="modalToggleSlider"></div>
          <button class="modal-toggle-btn active" id="btnToggleSearch" onclick="switchModalMode('search')">
            <svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            Keresés
          </button>
          <button class="modal-toggle-btn" id="btnToggleGemini" onclick="switchModalMode('gemini')">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 4.39999L14.7 7.29999L11.8 8.59999L14.7 9.89999L16 12.8L17.3 9.89999L20.2 8.59999L17.3 7.29999L16 4.39999ZM8.24996 6.89999L6.11996 11.6L1.39996 13.7L6.11996 15.8L8.24996 20.5L10.38 15.8L15.1 13.7L10.38 11.6L8.24996 6.89999Z"/></svg>
            AI Asszisztens
          </button>
        </div>
      </div>
      <div class="search-input-wrapper">
        <svg id="modalInputIcon" class="search-input-icon" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
        <input type="text" id="modalInput" class="search-input" placeholder="Mit keresel? Írd be ide...">
      </div>
      <div class="search-results-placeholder" id="modalPlaceholderText">
        A keresési találatok itt fognak megjelenni...
      </div>
    </div>
  </dialog>
  <script>
    function openSearchModal(mode) {
      document.getElementById('searchModal').showModal();
      // Ensure slider width is set when modal opens (if it wasn't on load due to display:none)
      const btnSearch = document.getElementById('btnToggleSearch');
      const slider = document.getElementById('modalToggleSlider');
      if(btnSearch && slider && slider.style.width === '') {
          slider.style.width = btnSearch.offsetWidth + 'px';
      }
      switchModalMode(mode);
    }
    
    function switchModalMode(mode) {
      const btnSearch = document.getElementById('btnToggleSearch');
      const btnGemini = document.getElementById('btnToggleGemini');
      const slider = document.getElementById('modalToggleSlider');
      const input = document.getElementById('modalInput');
      const icon = document.getElementById('modalInputIcon');
      const placeholder = document.getElementById('modalPlaceholderText');
      const title = document.getElementById('modalTitle');
      
      if (mode === 'gemini') {
        btnSearch.classList.remove('active');
        btnGemini.classList.add('active');
        slider.style.width = btnGemini.offsetWidth + 'px';
        slider.style.transform = `translateX(${btnSearch.offsetWidth}px)`;
        slider.style.backgroundColor = '#A259FF';
        
        input.classList.add('gemini-mode');
        input.placeholder = "Miben segíthetek? Kérdezz a Geminitől...";
        title.innerText = "AI Csevegés";
        title.style.color = "#A259FF";
        placeholder.innerText = "A Gemini válasza itt fog megjelenni...";
        
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.innerHTML = '<path d="M16 4.39999L14.7 7.29999L11.8 8.59999L14.7 9.89999L16 12.8L17.3 9.89999L20.2 8.59999L17.3 7.29999L16 4.39999ZM8.24996 6.89999L6.11996 11.6L1.39996 13.7L6.11996 15.8L8.24996 20.5L10.38 15.8L15.1 13.7L10.38 11.6L8.24996 6.89999Z"/>';
        icon.style.fill = '#A259FF';
        
      } else {
        btnGemini.classList.remove('active');
        btnSearch.classList.add('active');
        slider.style.width = btnSearch.offsetWidth + 'px';
        slider.style.transform = 'translateX(0)';
        slider.style.backgroundColor = 'var(--color-teal)';
        
        input.classList.remove('gemini-mode');
        input.placeholder = "Mit keresel? Írd be ide...";
        title.innerText = "Keresés az oldalon";
        title.style.color = "var(--color-teal)";
        placeholder.innerText = "A keresési találatok itt fognak megjelenni...";
        
        icon.setAttribute('viewBox', '0 0 512 512');
        icon.innerHTML = '<path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>';
        icon.style.fill = 'var(--color-red)';
      }
    }
  </script>
"""

modal_pattern = re.compile(r'\s*<!-- Search Modal -->\s*<dialog id="searchModal".*?</dialog>', re.DOTALL)

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    
    if old_nav_block in content:
        content = content.replace(old_nav_block, new_nav_block)
        changed = True
        
    if modal_pattern.search(content):
        content = modal_pattern.sub('\n' + new_modal, content)
        changed = True
        
    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {file}")

print("Done patching HTML files for Gemini.")
