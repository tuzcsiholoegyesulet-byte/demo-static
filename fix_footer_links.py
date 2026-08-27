import glob
import re

html_files = glob.glob('*.html')

standard_footer_links = """      <div class="footer-links">
        <a href="impresszum.html">Impresszum</a>
        <a href="adatkezelesi-tajekoztato.html">Adatvédelmi tájékoztató</a>
        <a href="sutikezelesi-szabalyzat.html">Sütikezelési szabályzat</a>
        <a href="akadalymentesitesi-nyilatkozat.html">Akadálymentesítési nyilatkozat</a>
      </div>"""

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Regex to find the footer-links div and replace it entirely
        pattern = re.compile(r'<div class="footer-links">.*?</div>', re.DOTALL)
        
        new_content = pattern.sub(standard_footer_links, content)
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Standardized footer in {file}")
    except Exception as e:
        print(f"Error in {file}: {e}")

print("Done.")
