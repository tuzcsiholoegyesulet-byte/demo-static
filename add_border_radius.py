import sys

with open('kik-vagyunk.html', 'r') as f:
    content = f.read()

# 1. Update logo card red background container to have border-radius
content = content.replace(
    '<div style="width: 200px; flex-shrink: 0; background-color: var(--color-red); display: flex; align-items: center; justify-content: center;">',
    '<div style="width: 200px; flex-shrink: 0; background-color: var(--color-red); display: flex; align-items: center; justify-content: center; border-radius: 12px;">'
)

# 2. Update Aranka photo to have border-radius
content = content.replace(
    '<img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%;">',
    '<img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%; border-radius: 12px;">'
)

# 3. Update Lakasugynokseg photo to have border-radius
content = content.replace(
    '<img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">',
    '<img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 12px;">'
)

# 4. Update Apathy Judit photo to have border-radius
content = content.replace(
    '<img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">',
    '<img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 12px;">'
)

with open('kik-vagyunk.html', 'w') as f:
    f.write(content)
print("Added border-radius to images and red container.")
