import sys

with open('kik-vagyunk.html', 'r') as f:
    content = f.read()

# 1. Update logo card (keep red background filling the 200px space, just ensure the logo itself looks good)
# The logo container is already width: 200px and stretches. The logo image inside is 160x200. This is fine.
# Wait, if the user means the red background is huge, I will leave it as is, because they asked to enlarge the OTHER images.

# 2. Update Aranka photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 160px; height: 200px; object-fit: cover; object-position: center 15%; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%;">\n            </div>'
)

# 3. Update Lakasugynokseg photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 160px; height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">\n            </div>'
)

# 4. Update Apathy Judit photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 160px; height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">\n            </div>'
)


with open('kik-vagyunk.html', 'w') as f:
    f.write(content)
print("Enlarged photos to fill the 200px column.")
