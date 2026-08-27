import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Remove from footer-links
        # Look for <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a> in footer-links
        content = content.replace('  <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a>\n      </div>', '</div>')
        content = content.replace('        <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a>\n      </div>', '</div>')
        
        # 2. Insert after Székhely in contact-info
        szekhely_line = '<p><strong>Székhely:</strong> 1234 Budapest, Példa utca 12.</p>'
        new_szekhely_line = '<p><strong>Székhely:</strong> 1234 Budapest, Példa utca 12.</p>\n              <a href="kik-vagyunk.html#elerhetosegek" class="btn" style="background-color: var(--color-teal); border: none; margin-top: 10px; display: inline-block; color: #fff;">Munkatársaink elérhetőségei</a>'
        
        if szekhely_line in content and 'Munkatársaink elérhetőségei' not in content[content.find(szekhely_line):content.find(szekhely_line)+300]:
            content = content.replace(szekhely_line, new_szekhely_line)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Fixed {file}")
    except Exception as e:
        print(f"Error in {file}: {e}")

print("Done.")
