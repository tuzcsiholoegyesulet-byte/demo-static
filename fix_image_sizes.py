import sys

with open('kik-vagyunk.html', 'r') as f:
    content = f.read()

# 1. Update logo card
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; background-color: var(--color-red); display: flex; align-items: center; justify-content: center;">\n              <img src="images/global/Logo_BEZS_emblema.png" alt="Egyesület" style="width: 80%; object-fit: contain; border-radius: 12px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; background-color: var(--color-red); display: flex; align-items: center; justify-content: center;">\n              <img src="images/global/Logo_BEZS_emblema.png" alt="Egyesület" style="width: 160px; height: 200px; object-fit: contain; border-radius: 16px;">\n            </div>'
)

# 2. Update Aranka photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center 15%; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 160px; height: 200px; object-fit: cover; object-position: center 15%; border-radius: 16px;">\n            </div>'
)

# 3. Update Lakasugynokseg photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 160px; height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>'
)

# 4. Update Apathy Judit photo
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 160px; height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>'
)


with open('kik-vagyunk.html', 'w') as f:
    f.write(content)
print("Updated all image sizes to 160x200px.")
