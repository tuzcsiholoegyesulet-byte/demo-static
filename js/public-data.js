import { db } from './auth.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elemek
const teamListMain = document.getElementById('team-list-main');
const teamListAdditional = document.getElementById('team-list-additional');
const tovabbiTagokTitle = document.getElementById('tovabbi-tagok-title');
const sponsorsContainer = document.getElementById('sponsors-container');

// Csapattagok betöltése
async function loadTeamMembers() {
    if (!teamListMain) return;

    try {
        const teamRef = collection(db, 'team');
        const q = query(teamRef, orderBy('order', 'asc'), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            teamListMain.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%;">Még nincsenek csapattagok feltöltve.</div>';
            return;
        }

        teamListMain.innerHTML = '';
        if (teamListAdditional) teamListAdditional.innerHTML = '';
        
        let hasAdditional = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Kártya HTML összeállítása
            const html = `
            <div class="team-member-row">
                <div class="team-member-left">
                    <div class="team-img-wrapper">
                        <img src="${data.imageUrl || 'images/global/placeholder-user.jpg'}" alt="${data.name}" class="team-img" onerror="this.src='images/global/placeholder-user.jpg'">
                    </div>
                    <div class="team-member-firstname">${data.nickname || data.name.split(' ').pop()}</div>
                </div>
                <div class="team-info">
                    <h3>${data.name}</h3>
                    ${data.role ? `<h4>${data.role}</h4>` : ''}
                    ${data.description ? `<p>${data.description.replace(/\n/g, '<br>')}</p>` : ''}
                    
                    <div class="team-contact">
                        ${data.email ? `
                        <a href="mailto:${data.email}" class="team-contact-item">
                            <svg viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                            ${data.email}
                        </a>` : ''}
                        ${data.phone ? `
                        <a href="tel:${data.phone.replace(/\s/g, '')}" class="team-contact-item">
                            <svg viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                            ${data.phone}
                        </a>` : ''}
                    </div>
                </div>
            </div>
            `;
            
            if (data.category === 'tovabbi_tag' && teamListAdditional) {
                teamListAdditional.insertAdjacentHTML('beforeend', html);
                hasAdditional = true;
            } else {
                teamListMain.insertAdjacentHTML('beforeend', html);
            }
        });
        
        if (hasAdditional && tovabbiTagokTitle) {
            tovabbiTagokTitle.style.display = 'block';
        }

    } catch (error) {
        console.error("Hiba a csapattagok betöltésekor:", error);
        teamListContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; color: red;">Hiba történt az adatok betöltésekor.</div>';
    }
}

// Támogatók betöltése
async function loadSponsors() {
    if (!sponsorsContainer) return;

    try {
        const sponsorsRef = collection(db, 'sponsors');
        const q = query(sponsorsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            sponsorsContainer.innerHTML = '<span style="color: var(--color-teal); font-weight: 500;">Még nincsenek támogatók feltöltve.</span>';
            return;
        }

        sponsorsContainer.innerHTML = '';
        sponsorsContainer.style.display = 'flex';
        sponsorsContainer.style.flexWrap = 'wrap';
        sponsorsContainer.style.gap = '2rem';
        sponsorsContainer.style.justifyContent = 'center';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const html = `
            <a href="${data.url || '#'}" target="_blank" rel="noopener noreferrer" style="display: block; transition: transform 0.3s ease;">
                <img src="${data.imageUrl}" alt="${data.name}" style="max-height: 80px; max-width: 200px; object-fit: contain;">
            </a>
            `;
            sponsorsContainer.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error("Hiba a támogatók betöltésekor:", error);
        sponsorsContainer.innerHTML = '<span style="color: red; font-weight: 500;">Hiba történt az adatok betöltésekor.</span>';
    }
}

// Hírek betöltése (Főoldalra)
async function loadNews() {
    const newsGridContainer = document.getElementById('news-grid-container');
    if (!newsGridContainer) return;

    try {
        const newsRef = collection(db, 'news');
        const q = query(newsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            newsGridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; grid-column: 1 / -1; color: var(--color-gray);">Jelenleg nincsenek feltöltött hírek.</div>';
            return;
        }

        newsGridContainer.innerHTML = '';
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.published) return; // Csak a publikus hírek
            if (count >= 3) return; // Csak a legújabb 3
            
            let dateStr = '';
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
            }

            const html = `
            <article class="news-card" onclick="window.location='hir.html?id=${doc.id}';" style="cursor: pointer;">
                <div class="news-image" style="background: url('${data.imageUrl || 'images/global/Logo_BEZS_emblema.png'}') center/cover;"></div>
                <div class="news-content">
                  <span class="news-date">${dateStr}</span>
                  <h3 class="news-title">${data.title}</h3>
                  <p class="news-excerpt">${data.excerpt}</p>
                  <a href="hir.html?id=${doc.id}" class="news-read-more">
                    Tovább olvasom
                    <svg viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                  </a>
                </div>
            </article>
            `;
            newsGridContainer.insertAdjacentHTML('beforeend', html);
            count++;
        });
        
        if (newsGridContainer.innerHTML === '') {
            newsGridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; grid-column: 1 / -1; color: var(--color-gray);">Jelenleg nincsenek publikus hírek.</div>';
        }

    } catch (error) {
        console.error("Hiba a hírek betöltésekor:", error);
        newsGridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; grid-column: 1 / -1; color: red;">Hiba történt a hírek betöltésekor.</div>';
    }
}

// Inicializálás, ha az oldal betöltött
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
    loadSponsors();
    loadNews();
});
