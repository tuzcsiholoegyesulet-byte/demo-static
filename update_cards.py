import sys

with open('kik-vagyunk.html', 'r') as f:
    content = f.read()

# 1. Update logo background color to red and round the image container
content = content.replace(
    'width: 200px; flex-shrink: 0; background-color: #f9f9f9; display: flex; align-items: center; justify-content: center; border-right: 1px solid #eee;',
    'width: 200px; flex-shrink: 0; background-color: var(--color-red); display: flex; align-items: center; justify-content: center;'
)

# Replace the logo img tag to make it rounded
content = content.replace(
    '<img src="images/global/Logo_BEZS_emblema.png" alt="Egyesület" style="width: 80%; object-fit: contain;">',
    '<img src="images/global/Logo_BEZS_emblema.png" alt="Egyesület" style="width: 80%; object-fit: contain; border-radius: 12px;">'
)

# 2. Update the other three images to be rounded and have some padding so the rounding is visible on all sides
# Gyermekvédelem
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center 15%; border-radius: 16px;">\n            </div>'
)

# Lakásügynökség
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>'
)

# Kommunikáció
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">\n            </div>',
    '<div style="width: 200px; flex-shrink: 0; padding: 1.5rem; display: flex; align-items: center;">\n              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; max-height: 200px; object-fit: cover; object-position: center; border-radius: 16px;">\n            </div>'
)


with open('kik-vagyunk.html', 'w') as f:
    f.write(content)
print("Updated card styles successfully")
