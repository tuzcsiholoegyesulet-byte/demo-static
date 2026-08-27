import re

file_path = "digitalis-bisztro.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ("('Dobostorta', 150, '🍰')", "('Dobostorta', 150, '<img src=\\'images/bisztro/dobostorta.png\\' alt=\\'Dobostorta\\'>')"),
    ('<div class="cake-icon">🍰</div>\\s*<div class="cake-name">Dobostorta</div>', '<div class="cake-icon"><img src="images/bisztro/dobostorta.png" alt="Dobostorta"></div>\\n                <div class="cake-name">Dobostorta</div>'),
    
    ("('Rákóczi túrós', 150, '🍰')", "('Rákóczi túrós', 150, '<img src=\\'images/bisztro/rakoczi_turos.png\\' alt=\\'Rákóczi túrós\\'>')"),
    ('<div class="cake-icon">🍰</div>\\s*<div class="cake-name">Rákóczi túrós</div>', '<div class="cake-icon"><img src="images/bisztro/rakoczi_turos.png" alt="Rákóczi túrós"></div>\\n                <div class="cake-name">Rákóczi túrós</div>'),
    
    ("('Krémes', 150, '🍮')", "('Krémes', 150, '<img src=\\'images/bisztro/kremes.png\\' alt=\\'Krémes\\'>')"),
    ('<div class="cake-icon">🍮</div>\\s*<div class="cake-name">Krémes</div>', '<div class="cake-icon"><img src="images/bisztro/kremes.png" alt="Krémes"></div>\\n                <div class="cake-name">Krémes</div>'),
    
    ("('Somlói galuska', 150, '🍨')", "('Somlói galuska', 150, '<img src=\\'images/bisztro/somloi_galuska.png\\' alt=\\'Somlói galuska\\'>')"),
    ('<div class="cake-icon">🍨</div>\\s*<div class="cake-name">Somlói galuska</div>', '<div class="cake-icon"><img src="images/bisztro/somloi_galuska.png" alt="Somlói galuska"></div>\\n                <div class="cake-name">Somlói galuska</div>'),
    
    ("('Zserbó', 150, '🍰')", "('Zserbó', 150, '<img src=\\'images/bisztro/zserbo.png\\' alt=\\'Zserbó\\'>')"),
    ('<div class="cake-icon">🍰</div>\\s*<div class="cake-name">Zserbó</div>', '<div class="cake-icon"><img src="images/bisztro/zserbo.png" alt="Zserbó"></div>\\n                <div class="cake-name">Zserbó</div>'),
    
    ("('Eszterházy torta', 150, '🍰')", "('Eszterházy torta', 150, '<img src=\\'images/bisztro/eszterhazy_torta.png\\' alt=\\'Eszterházy torta\\'>')"),
    ('<div class="cake-icon">🍰</div>\\s*<div class="cake-name">Eszterházy torta</div>', '<div class="cake-icon"><img src="images/bisztro/eszterhazy_torta.png" alt="Eszterházy torta"></div>\\n                <div class="cake-name">Eszterházy torta</div>'),
    
    ("('Isler', 150, '🍪')", "('Isler', 150, '<img src=\\'images/bisztro/isler.png\\' alt=\\'Isler\\'>')"),
    ('<div class="cake-icon">🍪</div>\\s*<div class="cake-name">Isler</div>', '<div class="cake-icon"><img src="images/bisztro/isler.png" alt="Isler"></div>\\n                <div class="cake-name">Isler</div>'),
    
    ("('Linzer', 150, '🍩')", "('Linzer', 150, '<img src=\\'images/bisztro/linzer.png\\' alt=\\'Linzer\\'>')"),
    ('<div class="cake-icon">🍩</div>\\s*<div class="cake-name">Linzer</div>', '<div class="cake-icon"><img src="images/bisztro/linzer.png" alt="Linzer"></div>\\n                <div class="cake-name">Linzer</div>'),
    
    ("('Képviselőfánk', 150, '🧁')", "('Képviselőfánk', 150, '<img src=\\'images/bisztro/kepviselofank.png\\' alt=\\'Képviselőfánk\\'>')"),
    ('<div class="cake-icon">🧁</div>\\s*<div class="cake-name">Képviselőfánk</div>', '<div class="cake-icon"><img src="images/bisztro/kepviselofank.png" alt="Képviselőfánk"></div>\\n                <div class="cake-name">Képviselőfánk</div>'),
    
    ("('Gyümölcstorta', 150, '🥧')", "('Gyümölcstorta', 150, '<img src=\\'images/bisztro/gyumolcstorta.png\\' alt=\\'Gyümölcstorta\\'>')"),
    ('<div class="cake-icon">🥧</div>\\s*<div class="cake-name">Gyümölcstorta</div>', '<div class="cake-icon"><img src="images/bisztro/gyumolcstorta.png" alt="Gyümölcstorta"></div>\\n                <div class="cake-name">Gyümölcstorta</div>'),
    
    ("('Bonbon válogatás', 300, '🍫')", "('Bonbon válogatás', 300, '<img src=\\'images/bisztro/bonbon_valogatas.png\\' alt=\\'Bonbon válogatás\\'>')"),
    ('<div class="cake-icon">🍫</div>\\s*<div class="cake-name">Bonbon válogatás</div>', '<div class="cake-icon"><img src="images/bisztro/bonbon_valogatas.png" alt="Bonbon válogatás"></div>\\n                <div class="cake-name">Bonbon válogatás</div>'),
]

for target, replacement in replacements:
    content = re.sub(target, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced emojis with images.")
