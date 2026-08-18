      document.addEventListener('DOMContentLoaded', () => {
        const menuItems = document.querySelectorAll('.menu-item');
        const trayContainer = document.getElementById('tray-items');
        const totalPriceEl = document.getElementById('tray-total-price');
        const btnDonate = document.getElementById('btn-donate');
        
        let trays = { common: [], self: [] };
        let activeTab = 'common';
        let total = 0;

        let targetEmails = []; // now stores {id, name, email}

        window.switchTab = function(tabId) {
          activeTab = tabId;
          if (!trays[tabId]) trays[tabId] = [];
          updateTray();
        };

        
                window.removeFromTrayId = function(trayId, index) {
          if(trays[trayId]) {
            trays[trayId].splice(index, 1);
          }
          updateTray();
        };

        window.removeFromTray = function(index) {
          if(trays[activeTab]) {
            trays[activeTab].splice(index, 1);
          }
          updateTray();
        };

        
        

        
        
        window.activateOptions = function() {
          const val = document.getElementById('own-email').value;
          if (!val.includes('@')) {
            alert('Kérlek, adj meg egy érvényes email címet a folytatáshoz!');
            return;
          }
          const shareOptions = document.getElementById('tray-share-options');
          if (shareOptions) {
            shareOptions.classList.remove('disabled');
            shareOptions.classList.add('glow-effect');
            setTimeout(() => shareOptions.classList.remove('glow-effect'), 1500);
          }
          const btn = document.getElementById('btn-email-next');
          btn.textContent = '✓';
          btn.style.background = '#27ae60';
          updateTray();
        };

        function updateTray() {
          const trayItems = document.getElementById('tray-items');
          const totalPriceEl = document.getElementById('tray-total-price');
          const btnDonate = document.getElementById('btn-donate');
          const ownEmailInput = document.getElementById('own-email');
          const targetEmailContainer = document.getElementById('target-email-container');
          const trayNotice = document.getElementById('tray-notice');
          const tabsContainer = document.getElementById('tray-tabs-container');
          
          const hasOwnEmail = ownEmailInput ? ownEmailInput.value.includes('@') : false;
          
          let shareMode = 'none';
          const radioSelected = document.querySelector('input[name="share_mode"]:checked');
          if (radioSelected) shareMode = radioSelected.value;
          
          if (shareMode === 'none') {
            targetEmailContainer.style.display = 'none';
          } else {
            targetEmailContainer.style.display = 'block';
          }
          
          let selfName = 'Saját (Magamnak)';
          const ownNameInput = document.getElementById('own-name');
          if (ownNameInput && ownNameInput.value.trim() !== '') {
             selfName = ownNameInput.value.trim();
          }
          
          // Determine valid tabs
          const validTabs = [];
          if (shareMode === 'share') validTabs.push('common');
          if (shareMode === 'none' || shareMode === 'share') validTabs.push('self');
          if (shareMode !== 'none') targetEmails.forEach(t => validTabs.push(t.id));
          
          if (!validTabs.includes(activeTab)) {
             activeTab = validTabs.length > 0 ? validTabs[0] : null;
          }

          // Render Tabs
          tabsContainer.innerHTML = '';
          const createTab = (id, label) => {
            const btn = document.createElement('button');
            btn.className = `btn-tab ${activeTab === id ? 'active' : ''}`;
            btn.textContent = label;
            btn.onclick = () => switchTab(id);
            tabsContainer.appendChild(btn);
            if(!trays[id]) trays[id] = [];
          };
          
          if (validTabs.includes('common')) createTab('common', 'Közös kör');
          if (validTabs.includes('self')) createTab('self', selfName);
          targetEmails.forEach(t => {
             if (validTabs.includes(t.id)) createTab(t.id, t.name || t.email.split('@')[0]);
          });
          
          // Render Tray Items (Grouped by Name)
          trayItems.innerHTML = '';
          
          const activeTrayIds = validTabs;
          
          activeTrayIds.forEach(trayId => {
             const trayData = trays[trayId] || [];
             let trayName = 'Közös kör';
             if (trayId === 'self') trayName = selfName;
             else if (trayId.startsWith('target_')) {
                const t = targetEmails.find(x => x.id === trayId);
                if (t) trayName = t.name ? t.name : t.email.split('@')[0];
             }
             
             const groupEl = document.createElement('div');
             groupEl.style.marginBottom = '1.5rem';
             
             // Visual highlight for the active tab
             if (activeTab === trayId) {
                groupEl.style.background = 'rgba(211, 84, 0, 0.05)';
                groupEl.style.borderRadius = '8px';
                groupEl.style.padding = '0.5rem';
                groupEl.style.borderLeft = '3px solid #d35400';
             }
             
             let itemsHtml = `<div style="font-weight: 700; border-bottom: 2px dashed #bdc3c7; padding-bottom: 0.3rem; margin-bottom: 0.8rem; color: ${activeTab === trayId ? '#d35400' : '#34495e'}; font-size: 1.1rem;">${trayName} rendelése</div>`;
             
             if (trayData.length === 0) {
                itemsHtml += '<p style="text-align: center; color: #7f8c8d; font-size: 0.85rem; margin-top: 0.5rem;">Ez a tálca még üres.</p>';
             } else {
                trayData.forEach((item, index) => {
                   itemsHtml += `
                    <div class="tray-item" style="margin-bottom: 0.5rem;">
                      <div class="tray-item-icon">${item.icon}</div>
                      <div class="tray-item-details">
                        <div class="tray-item-name">${item.name}</div>
                        <div class="tray-item-price">${item.price} Ft</div>
                      </div>
                      <button class="tray-item-remove" onclick="removeFromTrayId('${trayId}', ${index})">&times;</button>
                    </div>
                   `;
                });
             }
             
             groupEl.innerHTML = itemsHtml;
             trayItems.appendChild(groupEl);
          });

          // Calculate Totals
          let finalTotal = 0;
          
          const currentInputVal = document.getElementById('target-email-input').value.trim();
          const validCurrentInput = currentInputVal.includes('@') ? 1 : 0;
          const emailsCount = targetEmails.length + validCurrentInput;
          
          let commonMultiplier = 1;
          if (shareMode === 'share') {
             commonMultiplier = 1 + emailsCount;
          } else if (shareMode === 'gift') {
             commonMultiplier = Math.max(1, emailsCount);
          }
          
          // Sum common
          let commonSum = (trays['common'] || []).reduce((s, i) => s + i.price, 0);
          finalTotal += commonSum * commonMultiplier;
          
          // Sum self
          if (shareMode !== 'gift') {
             finalTotal += (trays['self'] || []).reduce((s, i) => s + i.price, 0);
          }
          
          // Sum targets
          targetEmails.forEach(t => {
             finalTotal += (trays[t.id] || []).reduce((s, i) => s + i.price, 0);
          });
          
          if(totalPriceEl) totalPriceEl.textContent = finalTotal;

          // Validation
          const hasAnyItems = Object.values(trays).some(t => t.length > 0);
          let canDonate = hasOwnEmail && hasAnyItems;
          
          if (shareMode !== 'none' && emailsCount === 0) {
             canDonate = false;
             if (hasAnyItems) trayNotice.style.display = 'block';
          } else {
             trayNotice.style.display = 'none';
          }

          if(btnDonate) btnDonate.disabled = !canDonate;
        }
        
        // Ensure removeFromTray uses activeTab
                window.removeFromTrayId = function(trayId, index) {
          if(trays[trayId]) {
            trays[trayId].splice(index, 1);
          }
          updateTray();
        };

        window.removeFromTray = function(index) {
          if(trays[activeTab]) {
            trays[activeTab].splice(index, 1);
          }
          updateTray();
        };

        window.addTargetEmail = function() {
          const inputEmail = document.getElementById('target-email-input');
          const inputName = document.getElementById('target-name-input');
          const email = inputEmail.value.trim();
          const name = inputName ? inputName.value.trim() : '';
          
          if (email.includes('@') && !targetEmails.find(t => t.email === email)) {
            const id = 'target_' + Date.now();
            targetEmails.push({ id, email, name });
            trays[id] = [];
            
            inputEmail.value = '';
            if (inputName) inputName.value = '';
            
            renderTargetEmails();
            updateTray();
          }
        }
        window.removeTargetEmail = function(id) {
          targetEmails = targetEmails.filter(t => t.id !== id);
          delete trays[id];
          if(activeTab === id) activeTab = 'common';
          renderTargetEmails();
          updateTray();
        }
        window.updateTray = updateTray;

        function renderTargetEmails() {
          const list = document.getElementById('target-emails-list');
          list.innerHTML = '';
          targetEmails.forEach(t => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.padding = '0.8rem 1rem';
            row.style.background = '#f1f2f6';
            row.style.borderRadius = '8px';
            row.style.marginBottom = '0.5rem';
            row.style.fontWeight = '600';
            row.style.color = '#3e2723';
            
            const displayName = t.name ? `${t.name} <span style="font-weight:400; color:#7f8c8d; font-size:0.9rem;">(${t.email})</span>` : t.email;
            row.innerHTML = `<span>${displayName}</span><button type="button" onclick="removeTargetEmail('${t.id}')" style="background:none; border:none; color:#e74c3c; font-size:1.5rem; cursor:pointer; line-height:1;">&times;</button>`;
            list.appendChild(row);
          });
        }

        menuItems.forEach(item => {
          item.addEventListener('click', () => {
            const name = item.getAttribute('data-name');
            const price = parseInt(item.getAttribute('data-price'));
            const icon = item.getAttribute('data-icon');
            
            if(!trays[activeTab]) trays[activeTab]=[];
            trays[activeTab].push({ name, price, icon });
            updateTray();
          });
        });

        trayContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('tray-item-remove')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            tray.splice(index, 1);
            updateTray();
          }
        });

        btnDonate.addEventListener('click', () => {
          if(total > 0) {
            alert(`Köszönjük a meghívást! Összesen ${total.toLocaleString('hu-HU')} Ft adományozásához átirányítunk a Stripe felületre.`);
            // Stripe integration here
          }
        });
      
        
        const appGrid = document.getElementById('app-grid');

        // --- Cake Counter Logic ---
        const cakeCounterApp = document.getElementById('cake-counter-app');
        
        window.openCakeCounter = function() {
          hideAllApps();
          appGrid.classList.add('in-app');
          if(cakeCounterApp) cakeCounterApp.classList.remove('hidden');
          document.querySelectorAll('.app-card')[1].classList.add('active');
        };

        window.closeCakeCounter = function() {
          hideAllApps();
          appGrid.classList.remove('in-app');
        };
        
        // Stubs for other apps
        window.openBirthdayCake = function() {
          hideAllApps();
          appGrid.classList.add('in-app');
          document.querySelectorAll('.app-card')[2].classList.add('active');
          alert("Ez a modul hamarosan érkezik!");
        }
        window.openToastApp = function() {
          hideAllApps();
          appGrid.classList.add('in-app');
          document.querySelectorAll('.app-card')[3].classList.add('active');
          alert("Ez a modul hamarosan érkezik!");
        }

        window.addCakeToTray = function(name, price, icon) {
          if(!trays[activeTab]) trays[activeTab]=[];
            trays[activeTab].push({ name, price, icon });
          updateTray();
        };

        // --- Ultimate Bar App Logic ---
        const barApp = document.getElementById('bar-app');
        const currentDrinkPriceEl = document.getElementById('current-drink-price');
        const btnPrepareDrink = document.getElementById('btn-prepare-drink');
        const extraDropZone = document.getElementById('extra-drop-zone');

        // Helper to hide all apps
        function hideAllApps() {
          if (barApp) barApp.classList.add('hidden');
          if (typeof cakeCounterApp !== 'undefined' && cakeCounterApp) cakeCounterApp.classList.add('hidden');
          // Add others here if they exist
          document.querySelectorAll('.app-card').forEach(c => c.classList.remove('active'));
        }

        window.openBarApp = function() {
          hideAllApps();
          appGrid.classList.add('in-app');
          barApp.classList.remove('hidden');
          document.querySelectorAll('.app-card')[0].classList.add('active');
          resetBarApp();
        };

        window.closeBarApp = function() {
          hideAllApps();
          appGrid.classList.remove('in-app');
        };

        let drinkBase = null;
        let drinkCategory = null;
        let drinkBasePrice = 0;
        let drinkExtras = [];

        function updateDrinkPrice() {
          let total = drinkBasePrice;
          drinkExtras.forEach(ex => total += ex.price);
          currentDrinkPriceEl.textContent = total;
          btnPrepareDrink.disabled = (drinkBase === null);
        }

        window.selectDrinkBase = function(category, name, price, btnEl) {
          drinkBase = name;
          drinkCategory = category;
          drinkBasePrice = price;
          
          document.querySelectorAll('#bar-app .btn-select').forEach(b => b.classList.remove('active'));
          btnEl.classList.add('active');
          drinkExtras = [];
          
          // No need to hide/show visuals or extras since everything is displayed row by row.
          
          const activeRow = document.getElementById(`row-${category}`);
          if (activeRow) {
             // Reset animation if already playing
             activeRow.classList.remove('brewing');
             void activeRow.offsetWidth; // trigger reflow
             activeRow.classList.add('brewing');
          }
          if (category === 'coffee') {
            const liquid = document.getElementById('cup-liquid');
            if (liquid) {
                let color = '#3e2723'; // Espresso
                if (name.includes('Latte')) color = '#a67c52';
                else if (name.includes('Melange')) color = 'linear-gradient(to top, #e6b800 25%, #5d4037 25%, #5d4037 100%)'; // Honey bottom, coffee top
                else if (name.includes('Cappuccino')) color = '#8b5a2b';
                liquid.style.background = color;
            }
            const steam = document.getElementById('cup-steam');
            if (steam) {
                steam.classList.remove('active');
                void steam.offsetWidth;
                steam.classList.add('active');
            }
          } else if (category === 'blender') {
            const liquid = document.getElementById('shake-liquid');
            const flakes = document.getElementById('shake-snowflakes');
            if (liquid) {
                let color = '#f1c40f'; 
                if (name.includes('Csokis')) color = '#5d4037';
                else if (name.includes('Sós Karamell')) color = '#d35400';
                else if (name.includes('Epres')) color = '#ff7675';
                else if (name.includes('Vaníliás') || name.includes('Banános')) color = '#ffeaa7';
                liquid.style.background = color;
            }
            if (flakes) {
                flakes.innerHTML = '❄️❄️❄️';
                flakes.classList.remove('active');
                void flakes.offsetWidth;
                flakes.classList.add('active');
            }
          } else if (category === 'soda') {
            const liquid = document.getElementById('soda-liquid');
            const bubbles = document.getElementById('soda-bubbles');
            if (liquid) {
                liquid.style.background = '#f1c40f'; // Lemonade yellow
            }
            if (bubbles) {
                bubbles.classList.remove('active');
                if (name.includes('Bubis')) {
                    void bubbles.offsetWidth;
                    bubbles.classList.add('active');
                }
            }
          } else if (category === 'beer') {
            const liquid = document.getElementById('beer-liquid');
            const foam = document.getElementById('beer-foam');
            if (liquid) {
                let color = '#f1c40f'; // Lager yellow
                if (name.includes('Barna') || name.includes('Stout')) color = '#4a2511';
                else if (name.includes('Meggy')) color = '#9b111e';
                else if (name.includes('IPA')) color = '#d35400';
                else if (name.includes('Búza')) color = '#f39c12';
                liquid.style.background = color;
            }
            if (foam) {
                foam.classList.remove('active');
                void foam.offsetWidth;
                foam.classList.add('active');
            }
          } else if (category === 'wine') {
            const liquid = document.getElementById('wine-liquid');
            const bubbles = document.getElementById('wine-bubbles');
            if (liquid) {
                let color = '#722f37'; // Vörösbor (Red)
                if (name.includes('Fehérbor')) color = '#f8e5a1';
                else if (name.includes('Rosé')) color = '#ffb6c1';
                else if (name.includes('Pezsgő')) color = '#f3e5ab';
                liquid.style.background = color;
            }
            if (bubbles) {
                bubbles.classList.remove('active');
                if (name.includes('Pezsgő')) {
                    void bubbles.offsetWidth;
                    bubbles.classList.add('active');
                }
            }
          } else if (category === 'cocktail') {
            const liquid = document.getElementById('cocktail-liquid');
            if (liquid) {
                let color = '#2ecc71'; // Mojito
                if (name.includes('Piña')) color = '#f1f2f6';
                else if (name.includes('Margarita')) color = '#e9f7ef';
                else if (name.includes('Tequila Sunrise')) color = 'linear-gradient(to top, #c0392b, #f39c12)';
                else if (name.includes('Cosmopolitan')) color = '#ff4757';
                else if (name.includes('Aperol')) color = '#ff6b35';
                liquid.style.background = color;
            }
          }
          

          updateDrinkPrice();
        };

        window.toggleDrinkExtra = function(name, price, icon, btnEl) {
          if (!drinkBase) {
            alert('Előbb válassz egy italt ebből a kategóriából!');
            return;
          }
          const index = drinkExtras.findIndex(ex => ex.name === name);
          if (index > -1) {
            const removed = drinkExtras.splice(index, 1)[0];
            if (removed.element) removed.element.remove();
            btnEl.classList.remove('active');
          } else {
            const drop = document.createElement('div');
            drinkExtras.push({name, price, element: drop});
            btnEl.classList.add('active');
            
            // Append to the specific category's visual container so it falls IN the cup
            const activeRow = document.getElementById(`row-${drinkCategory}`);
            let targetZone = extraDropZone;
            if (activeRow) {
               const catVis = activeRow.querySelector('.category-visual');
               if (catVis) targetZone = catVis;
            }
            
            drop.className = 'extra-emoji extra-falling';
            drop.style.position = 'absolute';
            
            let endY = 60; // Default (e.g. coffee)
            if (drinkCategory === 'blender') {
                endY = 80; // Lower overall for shakes
                if (name === 'Tejszínhab') endY = 40; // Top of the shake
            } else if (drinkCategory === 'cocktail') {
                endY = 35; // Higher for cocktails to stay in the glass
                if (name === 'Esernyő') endY = 5; // Umbrella higher on the rim
            } else {
                if (name === 'Tejszínhab') endY = 20; // Top of the coffee
            }
            drop.style.setProperty('--end-y', endY + 'px');
            
            let offset = 40;
            if (name === 'Tejszínhab') {
                offset = 40; // True visual center accounting for emoji width (approx 10%)
            } else if (name === 'Esernyő') {
                offset = 62; // Rim of the glass (right side)
            } else {
                const cnt = drinkExtras.length;
                if (cnt === 1) offset = 40;      // Center
                else if (cnt === 2) offset = 30; // Left
                else if (cnt === 3) offset = 50; // Right
                else if (cnt === 4) offset = 20; // Far left
                else if (cnt === 5) offset = 60; // Far right
                else offset = 40 + (Math.random() * 40 - 20);
            }
            
            drop.style.left = offset + '%';
            drop.style.zIndex = '10';
            drop.textContent = icon;
            targetZone.appendChild(drop);
            
            setTimeout(() => {
                drop.classList.remove('extra-falling');
                drop.classList.add('extra-settled');
            }, 500);
          }
          updateDrinkPrice();
        };

        window.prepareDrink = function() {
          btnPrepareDrink.disabled = true;
          // Instantly add to tray without animation delay
          {

            let fullName = drinkBase;
            if (drinkExtras.length > 0) {
              const extraNames = drinkExtras.map(ex => ex.name).join(', ');
              fullName += ` (${extraNames})`;
            }
            
            let finalPrice = drinkBasePrice;
            drinkExtras.forEach(ex => finalPrice += ex.price);

            let drinkIcon = '☕';
            if (drinkCategory === 'blender') drinkIcon = '🥤';
            if (drinkCategory === 'beer') drinkIcon = '🍺';
            if (drinkCategory === 'wine') drinkIcon = '🍷';
            if (drinkCategory === 'cocktail') drinkIcon = '🍸';
            if (drinkCategory === 'soda' || drinkBase.includes('Limonádé')) drinkIcon = '🍹';

            if(!trays[activeTab]) trays[activeTab] = [];
            trays[activeTab].push({
              name: fullName,
              price: finalPrice,
              icon: drinkIcon
            });
            updateTray();
            
            resetBarApp();
            // alert(`A ${drinkBase} bekerült a tálcára! ${drinkIcon}`); // Removed annoying alert
            
          }
        };

        function resetBarApp() {
          drinkBase = null;
          drinkCategory = null;
          drinkBasePrice = 0;
          drinkExtras.forEach(ex => { if (ex.element) ex.element.remove(); });
          drinkExtras = [];
          document.querySelectorAll('#bar-app .btn-select').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.category-row').forEach(row => row.classList.remove('brewing'));
          const steam = document.getElementById('cup-steam');
          if(steam) steam.classList.remove('active');
          const flakes = document.getElementById('shake-snowflakes');
          if(flakes) flakes.classList.remove('active');
          const bubbles = document.getElementById('soda-bubbles');
          if(bubbles) bubbles.classList.remove('active');
          const foam = document.getElementById('beer-foam');
          if(foam) foam.classList.remove('active');
          const wineBubbles = document.getElementById('wine-bubbles');
          if(wineBubbles) wineBubbles.classList.remove('active');
          updateDrinkPrice();
        }

        // --- Birthday Cake Logic ---
        const birthdayCakeApp = document.getElementById('birthday-cake-app');
        const cakeFlagBanner = document.getElementById('cake-flag-banner');
        const cakeNameInput = document.getElementById('cake-name-input');
        const currentCakePriceEl = document.getElementById('current-cake-price');
        const cakeVisual = document.getElementById('cake-visual');
        const cakeFlame = document.getElementById('cake-flame');
        const btnLightCandle = document.getElementById('btn-light-candle');
        
        let cakeFlavor = 'Csokoládé';
        let bCakePrice = 1000;

        window.openBirthdayCake = function() {
          appGrid.classList.add('hidden');
          birthdayCakeApp.classList.remove('hidden');
          resetBirthdayCake();
        };

        window.closeBirthdayCake = function() {
          birthdayCakeApp.classList.add('hidden');
          appGrid.classList.remove('hidden');
        };

        window.selectCakeFlavor = function(name, price, color, btnEl) {
          cakeFlavor = name;
          bCakePrice = price;
          
          document.querySelectorAll('#cake-flavor-options .btn-select').forEach(b => b.classList.remove('active'));
          btnEl.classList.add('active');
          
          currentCakePriceEl.textContent = price;
          cakeVisual.style.setProperty('--cake-color', color);
        };

        window.updateCakeFlag = function() {
          const name = cakeNameInput.value.trim();
          cakeFlagBanner.textContent = name ? name : "Név";
        };

        window.lightCandleAndAddToTray = function() {
          const name = cakeNameInput.value.trim();
          if (!name) {
            alert('Kérlek, add meg az ünnepelt nevét a zászlóhoz!');
            cakeNameInput.focus();
            return;
          }
          
          btnLightCandle.disabled = true;
          cakeFlame.classList.add('lit');
          
          setTimeout(() => {
            const fullName = `Szülinapi Torta (${cakeFlavor}, Zászló: ${name})`;
            if(!trays[activeTab]) trays[activeTab]=[];
            trays[activeTab].push({
              name: fullName,
              price: bCakePrice,
              icon: '🎂'
            });
            updateTray();
            
            alert('A gyertya meggyulladt, a torta pedig felkerült a tálcára! 🎂');
            resetBirthdayCake();
          }, 1500); // Wait 1.5s for candle animation
        };

        function resetBirthdayCake() {
          cakeNameInput.value = '';
          updateCakeFlag();
          cakeFlame.classList.remove('lit');
          btnLightCandle.disabled = false;
        }

      
        // --- Toast App Logic ---
        const toastApp = document.getElementById('toast-app');
        const glassLeft = document.getElementById('glass-left');
        const glassRight = document.getElementById('glass-right');
        const toastVisual = document.getElementById('toast-visual');
        const toastNameInput = document.getElementById('toast-name-input');
        const currentToastPriceEl = document.getElementById('current-toast-price');
        const btnCheers = document.getElementById('btn-cheers');
        const confettiContainer = document.getElementById('confetti-container');

        let toastDrink = 'Pezsgő';
        let toastPrice = 500;
        let toastIcon = '🥂';

        window.openToastApp = function() {
          appGrid.classList.add('hidden');
          toastApp.classList.remove('hidden');
          resetToastApp();
        };

        window.closeToastApp = function() {
          toastApp.classList.add('hidden');
          appGrid.classList.remove('hidden');
        };

        window.selectToastDrink = function(name, price, icon, btnEl) {
          toastDrink = name;
          toastPrice = price;
          toastIcon = icon;
          
          document.querySelectorAll('#toast-drink-options .btn-select').forEach(b => b.classList.remove('active'));
          btnEl.classList.add('active');
          
          currentToastPriceEl.textContent = price;
          
          // Fix for champagne emoji which is already two glasses, just show one if possible, or use standard emojis
          let displayIcon = icon;
          if (icon === '🥂') displayIcon = '🍾'; // use bottle for left, or just 🥂 for both
          
          // Let's just use the selected icon for both
          glassLeft.textContent = icon;
          glassRight.textContent = icon;
        };

        window.cheersAndAddToTray = function() {
          const name = toastNameInput.value.trim();
          if (!name) {
            alert('Kérlek, add meg a névnapos nevét!');
            toastNameInput.focus();
            return;
          }
          
          btnCheers.disabled = true;
          toastVisual.classList.add('cheers');
          
          // Generate Confetti
          confettiContainer.innerHTML = '';
          const colors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];
          for(let i=0; i<30; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + '%';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animation = `confetti-fall ${1 + Math.random()}s ease-in forwards`;
            confettiContainer.appendChild(conf);
          }
          
          setTimeout(() => {
            const fullName = `Koccintás (${toastDrink}, ${name} részére)`;
            if(!trays[activeTab]) trays[activeTab]=[];
            trays[activeTab].push({
              name: fullName,
              price: toastPrice,
              icon: toastIcon
            });
            updateTray();
            
            alert('Koccintottatok! Az italok a tálcára kerültek. Egészségetekre! 🥂');
            resetToastApp();
          }, 1500);
        };

        function resetToastApp() {
          toastNameInput.value = '';
          toastVisual.classList.remove('cheers');
          confettiContainer.innerHTML = '';
          btnCheers.disabled = false;
        }

      // Slideshow Auto-play
      let currentSlide = 0;
      const slides = document.querySelectorAll('.bistro-slideshow .slide');
      if (slides.length > 0) {
        setInterval(() => {
          slides[currentSlide].classList.remove('active');
          currentSlide = (currentSlide + 1) % slides.length;
          slides[currentSlide].classList.add('active');
        }, 4000);
      }

      // Lightbox Logic
      window.lightboxIndex = 0;
      window.openLightbox = function() {
        document.getElementById('bistro-lightbox').classList.add('active');
        window.lightboxIndex = currentSlide;
        window.updateLightbox();
      }
      window.closeLightbox = function() {
        document.getElementById('bistro-lightbox').classList.remove('active');
      }
      window.changeLightbox = function(step) {
        // Stop event propagation to prevent modal closing if clicked on arrows
        if (event) event.stopPropagation();
        window.lightboxIndex = (window.lightboxIndex + step + slides.length) % slides.length;
        window.updateLightbox();
      }
      window.updateLightbox = function() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg && slides.length > 0) {
            lightboxImg.src = slides[window.lightboxIndex].src;
        }
      }

      });
