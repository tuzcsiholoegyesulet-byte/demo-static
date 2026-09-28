import { db } from './auth.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elemek
const teamListContainer = document.getElementById('team-list-container');
const sponsorsContainer = document.getElementById('sponsors-container');

// Csapattagok betöltése
async function loadTeamMembers() {
    if (!teamListContainer) return;

    try {
        const teamRef = collection(db, 'team');
        const q = query(teamRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            teamListContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%;">Még nincsenek csapattagok feltöltve.</div>';
            return;
        }

        teamListContainer.innerHTML = ''; // Loading text eltávolítása

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Kártya HTML összeállítása
            const html = `
            <div class="team-member-row">
                <div class="team-member-left">
                    <div class="team-img-wrapper">
                        <img src="${data.imageUrl || 'images/global/placeholder-user.jpg'}" alt="${data.name}" class="team-img" onerror="this.src='images/global/placeholder-user.jpg'">
                    </div>
                    <div class="team-member-firstname">${data.name.split(' ').pop()}</div>
                </div>
                <div class="team-info">
                    <h3>${data.name}</h3>
                    ${data.role ? `<h4>${data.role}</h4>` : ''}
                    ${data.description ? `<p>${data.description.replace(/\\n/g, '<br>')}</p>` : ''}
                    
                    <div class="team-contact">
                        ${data.email ? `
                        <a href="mailto:${data.email}" class="team-contact-item">
                            <svg viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                            ${data.email}
                        </a>` : ''}
                        ${data.phone ? `
                        <a href="tel:${data.phone.replace(/\\s/g, '')}" class="team-contact-item">
                            <svg viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                            ${data.phone}
                        </a>` : ''}
                    </div>
                </div>
            </div>
            `;
            teamListContainer.insertAdjacentHTML('beforeend', html);
        });

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

// Inicializálás, ha az oldal betöltött
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
    loadSponsors();
});
