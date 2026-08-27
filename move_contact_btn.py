import glob
import re

# 1. Remove from impresszum.html
try:
    with open('impresszum.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the specific line
    pattern = re.compile(r'\s*<li style="list-style-type: none; margin: 15px 0;"><a href="kik-vagyunk\.html#elerhetosegek" class="btn btn-teal">Munkatársaink elérhetőségei</a></li>')
    new_content = pattern.sub('', content)
    
    with open('impresszum.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Removed button from impresszum.html")
except Exception as e:
    print(f"Error in impresszum.html: {e}")

# 2. Add to footer in all HTML files
html_files = glob.glob('*.html')

old_footer_links = """      <div class="footer-links">
        <a href="impresszum.html">Impresszum</a>
        <a href="adatkezelesi-tajekoztato.html">Adatvédelmi tájékoztató</a>
      </div>"""

new_footer_links = """      <div class="footer-links">
        <a href="impresszum.html">Impresszum</a>
        <a href="adatkezelesi-tajekoztato.html">Adatvédelmi tájékoztató</a>
        <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a>
      </div>"""

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if old_footer_links in content:
            content = content.replace(old_footer_links, new_footer_links)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched footer in {file}")
    except Exception as e:
        print(f"Error in {file}: {e}")

print("Done.")
