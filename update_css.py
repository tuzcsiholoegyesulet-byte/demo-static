import sys

with open('css/style.css', 'r') as f:
    content = f.read()

old_css = """/* Ensure the search icon in nav looks good */
.search-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-nav-item a {
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 10px !important;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}
.search-nav-item a::after {
  display: none !important;
}
.search-nav-item a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
.search-nav-item svg {
  width: 20px;
  height: 20px;
  fill: var(--color-white);
}
@media (max-width: 768px) {
  .search-nav-item {
    margin-top: 10px;
    margin-bottom: 10px;
  }
}
"""

new_css = """/* --- Expanding Search & Gemini Nav Item --- */
.search-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.search-nav-group {
  display: flex;
  align-items: center;
  gap: 0;
  background-color: transparent;
  border-radius: 30px;
  padding: 0;
  transition: all 0.3s ease;
}
.search-nav-item:hover .search-nav-group {
  background-color: rgba(255, 255, 255, 0.15);
}
.search-nav-btn {
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 10px !important;
  border-radius: 50%;
  transition: background-color 0.3s ease, transform 0.2s ease;
  cursor: pointer;
}
.search-nav-btn::after {
  display: none !important;
}
.search-nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}
.search-nav-btn svg {
  width: 20px;
  height: 20px;
  fill: var(--color-white);
  transition: fill 0.3s ease;
}
.search-nav-btn.gemini-btn {
  width: 0;
  opacity: 0;
  padding: 0 !important;
  margin-left: 0;
  pointer-events: none;
  overflow: hidden;
}
.search-nav-item:hover .search-nav-btn.gemini-btn {
  width: 40px;
  opacity: 1;
  padding: 10px !important;
  pointer-events: auto;
  margin-left: 4px;
}
.search-nav-btn.gemini-btn:hover svg {
  fill: #A259FF;
}

@media (max-width: 768px) {
  .search-nav-item {
    margin-top: 10px;
    margin-bottom: 10px;
  }
}

/* --- Modal Toggle Switch --- */
.modal-toggle-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.modal-toggle {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 30px;
  padding: 4px;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.modal-toggle-btn {
  background: transparent;
  border: none;
  padding: 8px 20px;
  border-radius: 26px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-toggle-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
.modal-toggle-btn.active {
  color: var(--color-white);
}
.modal-toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: var(--color-teal);
  border-radius: 26px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), width 0.3s ease;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* --- Mode-specific Input Styling --- */
.search-input.gemini-mode {
  background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,240,255,0.95) 100%);
}
.search-input.gemini-mode:focus {
  border-color: #A259FF;
  box-shadow: 0 0 0 4px rgba(162, 89, 255, 0.15);
}
.search-input-icon {
  transition: all 0.3s ease;
}
"""

if old_css in content:
    content = content.replace(old_css, new_css)
    with open('css/style.css', 'w') as f:
        f.write(content)
    print("CSS updated successfully.")
else:
    print("Warning: Old CSS not found exactly.")
