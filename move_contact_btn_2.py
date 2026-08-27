import glob
import re

html_files = glob.glob('*.html')

# We want to insert <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a> inside .footer-links if it's not already there.
for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'Munkatársaink elérhetőségei' not in content[content.find('<footer'):]:
            # Regex to find the footer-links div and insert before closing div
            # Look for <div class="footer-links"> ... </div>
            pattern = re.compile(r'(<div class="footer-links">.*?)(</div>)', re.DOTALL)
            
            def repl(match):
                inner = match.group(1)
                # Avoid double inserting if already there
                if 'Munkatársaink elérhetőségei' not in inner:
                    return inner + '  <a href="kik-vagyunk.html#elerhetosegek">Munkatársaink elérhetőségei</a>\n      ' + match.group(2)
                return match.group(0)
            
            new_content = pattern.sub(repl, content)
            if new_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Patched footer in {file} using regex")
    except Exception as e:
        print(f"Error in {file}: {e}")

print("Done phase 2.")
