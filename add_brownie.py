import re

file_path = "digitalis-bisztro.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

brownie_html = """              <button class="cake-item" onclick="addCakeToTray('Brownie', 200, '<img src=\\'images/bisztro/brownie.png\\' alt=\\'Brownie\\'>')">
                <div class="cake-icon"><img src="images/bisztro/brownie.png" alt="Brownie"></div>
                <div class="cake-name">Brownie</div>
                <div class="cake-price">200 Ft</div>
              </button>
"""

# Insert before Bonbon válogatás
target = '<button class="cake-item" onclick="addCakeToTray(\'Bonbon válogatás\''
content = content.replace(target, brownie_html + '              ' + target)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added Brownie.")
