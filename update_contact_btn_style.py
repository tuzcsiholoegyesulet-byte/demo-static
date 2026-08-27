import glob
import re

html_files = glob.glob('*.html')

old_line = '<a href="kik-vagyunk.html#elerhetosegek" class="btn" style="background-color: var(--color-teal); border: none; margin-top: 10px; display: inline-block; color: #fff;">Munkatársaink elérhetőségei</a>'
new_line = '<a href="kik-vagyunk.html#elerhetosegek" class="btn" style="background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50px; margin-top: 10px; display: inline-block; color: #fff; transition: background-color 0.3s ease;">Munkatársaink elérhetőségei</a>'

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if old_line in content:
            content = content.replace(old_line, new_line)
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated style in {file}")
    except Exception as e:
        print(f"Error in {file}: {e}")

print("Done.")
