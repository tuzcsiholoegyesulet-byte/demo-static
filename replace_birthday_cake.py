import re

file_path = "digitalis-bisztro.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the cake visual container internals
old_visual = """              <div class="cake-visual-container" id="cake-visual" style="--cake-color: #e67e22;">
                <div class="cake-flag-stick">
                  <div class="cake-flag-banner" id="cake-flag-banner">Név</div>
                </div>
                <div class="cake-candle">
                  <div class="cake-flame" id="cake-flame"></div>
                </div>
                <div class="cake-layer-top">
                  <div class="cake-frosting"></div>
                </div>
                <div class="cake-layer-bottom">
                  <div class="cake-text">Boldog<br>születésnapot!</div>
                </div>
              </div>"""

new_visual = """              <div class="cake-visual-container" id="cake-visual" style="--cake-filter: none;">
                <img src="images/bisztro/birthday_cake_base.png" class="cake-base-img" id="cake-base-img" alt="Szülinapi Torta">
                <div class="cake-flag-stick">
                  <div class="cake-flag-banner" id="cake-flag-banner">Név</div>
                </div>
                <div class="cake-candle">
                  <div class="cake-flame" id="cake-flame"></div>
                </div>
                <div class="cake-overlay-text">Boldog<br>születésnapot!</div>
              </div>"""

content = content.replace(old_visual, new_visual)

# Update selectCakeFlavor
old_select = """      function selectCakeFlavor(flavor, price, color, btnElement) {
        document.querySelectorAll('#cake-flavor-options .btn-select').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
        
        currentCakeParams.flavor = flavor;
        currentCakeParams.price = price;
        currentCakeParams.color = color;
        
        document.getElementById('current-cake-price').innerText = price;
        document.getElementById('cake-visual').style.setProperty('--cake-color', color);
      }"""

new_select = """      function selectCakeFlavor(flavor, price, color, btnElement) {
        document.querySelectorAll('#cake-flavor-options .btn-select').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
        
        currentCakeParams.flavor = flavor;
        currentCakeParams.price = price;
        currentCakeParams.color = color;
        
        document.getElementById('current-cake-price').innerText = price;
        
        // Use CSS filters to tint the chocolate base image
        let filter = 'none';
        if (flavor === 'Eper') filter = 'sepia(1) hue-rotate(290deg) saturate(3) brightness(1.2)';
        else if (flavor === 'Vanília') filter = 'sepia(0.8) hue-rotate(30deg) saturate(2) brightness(1.5)';
        else if (flavor === 'Áfonya') filter = 'sepia(1) hue-rotate(220deg) saturate(2) brightness(1.1)';
        
        document.getElementById('cake-visual').style.setProperty('--cake-filter', filter);
        document.getElementById('cake-base-img').style.filter = filter;
      }"""

content = content.replace(old_select, new_select)

# Update lightCandleAndAddToTray
old_light = """        const iconHtml = `<div style="width: 30px; height: 30px; border-radius: 50%; background: ${currentCakeParams.color}; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`;
        addCakeToTray(`🎂 ${currentCakeParams.flavor} Szülinapi Torta (${currentCakeParams.name})`, currentCakeParams.price, iconHtml);"""

new_light = """        const filterCSS = document.getElementById('cake-visual').style.getPropertyValue('--cake-filter');
        const iconHtml = `<img src="images/bisztro/birthday_cake_base.png" alt="Szülinapi Torta" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; filter: ${filterCSS};">`;
        addCakeToTray(`🎂 ${currentCakeParams.flavor} Szülinapi Torta (${currentCakeParams.name})`, currentCakeParams.price, iconHtml);"""

content = content.replace(old_light, new_light)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced visual container and js.")
