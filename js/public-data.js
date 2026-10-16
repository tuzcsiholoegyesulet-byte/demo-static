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

// Projektek betöltése
async function loadProjects() {
    const activeProjectsContainer = document.getElementById('public-active-projects-list');
    const completedProjectsContainer = document.getElementById('public-completed-projects-list');
    
    // Ha egyik konténer sincs az oldalon, nem csinálunk semmit
    if (!activeProjectsContainer && !completedProjectsContainer) return;

    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        let activeHtml = '';
        let completedHtml = '';
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const coverImage = data.imageUrl ? data.imageUrl : 'images/global/placeholder-project.jpg';
            const targetAmount = data.targetAmount || 0;
            const collectedAmount = data.collectedAmount || 0;
            const percentage = targetAmount > 0 ? Math.min(100, Math.floor((collectedAmount / targetAmount) * 100)) : 0;
            const isCompleted = targetAmount > 0 && collectedAmount >= targetAmount;
            
            const cardHtml = `
            <article class="project-card">
              <div class="project-img-wrapper">
                <img src="${coverImage}" alt="${data.title.replace(/"/g, '&quot;')}" class="project-img" style="object-fit: cover; height: 100%; width: 100%;">
              </div>
              <div class="project-content" style="padding: 1.5rem; flex: 1;">
                <div class="project-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                  <h3 style="margin-bottom: 0;">
                    <span style="color: inherit; border: none; background: none; padding: 0; font-family: inherit; font-size: inherit; font-weight: inherit; text-align: left;">${data.title}</span>
                  </h3>
                  ${!isCompleted && data.link ? `<a href="${data.link}" target="_blank" class="btn btn-red" style="padding: 0.5rem 1rem; font-size: 0.9rem; text-decoration: none; position: relative; z-index: 2;">Támogatom</a>` : ''}
                  ${!isCompleted && !data.link ? `<button class="btn btn-red open-project-modal" data-project="${data.title.replace(/"/g, '&quot;')}" style="padding: 0.5rem 1rem; font-size: 0.9rem; position: relative; z-index: 2;">Támogatom</button>` : ''}
                </div>
                <p style="margin-bottom: 1rem;">${data.description}</p>
                <div class="progress-stats" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 500;">
                  <span>Összegyűlt: ${collectedAmount.toLocaleString('hu-HU')} Ft</span>
                  <span>Cél: ${targetAmount.toLocaleString('hu-HU')} Ft</span>
                </div>
                <div class="progress-container" style="background-color: #e0e0e0; border-radius: 8px; overflow: hidden; height: 10px; width: 100%;">
                  <div class="progress-bar" style="width: ${percentage}%; background-color: var(--color-teal); height: 100%;"></div>
                </div>
              </div>
            </article>
            `;
            
            if (isCompleted) {
                completedHtml += cardHtml;
            } else {
                activeHtml += cardHtml;
            }
        });
        
        if (activeProjectsContainer) {
            if (activeHtml === '') {
                activeProjectsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; color: var(--color-gray);">Jelenleg nincsenek futó projektek.</div>';
            } else {
                activeProjectsContainer.innerHTML = activeHtml;
            }
        }
        
        if (completedProjectsContainer) {
            if (completedHtml === '') {
                completedProjectsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; color: var(--color-gray);">Jelenleg nincsenek befejezett projektek.</div>';
            } else {
                completedProjectsContainer.innerHTML = completedHtml;
            }
        }
    } catch (error) {
        console.error("Hiba a projektek betöltésekor:", error);
    }
}

// Támogass minket mini galéria betöltése
async function loadDonationGallery() {
    const galleryContainer = document.getElementById('scattered-gallery');
    if (!galleryContainer) return;

    try {
        const q = query(collection(db, "donation_gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return; // Megtartja az alapértelmezett képeket, ha még nincs semmi feltöltve
        }

        const angles = [
            { r: '-12deg', x: '-15px', y: '10px' },
            { r: '4deg', x: '0px', y: '-5px' },
            { r: '16deg', x: '15px', y: '5px' },
            { r: '-6deg', x: '-10px', y: '-8px' },
            { r: '10deg', x: '12px', y: '12px' },
            { r: '-15deg', x: '-5px', y: '15px' },
            { r: '8deg', x: '8px', y: '-10px' }
        ];

        let cardsHtml = '';
        let index = 0;
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const angle = angles[index % angles.length];
            cardsHtml += `
                <div class="scatter-card" data-index="${index}" style="--r: ${angle.r}; --x: ${angle.x}; --y: ${angle.y}; background-image: url('${data.imageUrl}')"></div>
            `;
            index++;
        });

        galleryContainer.innerHTML = `
            <div class="scatter-group" data-group="0">
                ${cardsHtml}
            </div>
        `;

        if (window.refreshGalleryLightbox) {
            window.refreshGalleryLightbox();
        }
    } catch (error) {
        console.error("Hiba a Támogass minket galéria betöltésekor:", error);
    }
}

// Gyermekvédelmi blogbejegyzések és modal kezelése
window.childWelfarePostsMap = {};

function openChildWelfareModal(id) {
    const post = window.childWelfarePostsMap ? window.childWelfarePostsMap[id] : null;
    if (!post) return;

    const modal = document.getElementById('childWelfareModal');
    if (!modal) return;

    const imgEl = document.getElementById('modalPostImage');
    const imgWrap = document.getElementById('modalPostImageWrapper');
    const titleEl = document.getElementById('modalPostTitle');
    const dateTextEl = document.getElementById('modalPostDateText');
    const dateWrap = document.getElementById('modalPostDate');
    const excerptEl = document.getElementById('modalPostExcerpt');
    const contentEl = document.getElementById('modalPostContent');

    if (post.imageUrl && post.imageUrl.trim() !== '') {
        imgEl.src = post.imageUrl;
        imgEl.alt = post.title;
        imgWrap.style.display = 'block';
    } else {
        imgWrap.style.display = 'none';
    }

    let dateStr = '';
    if (post.createdAt) {
        const date = post.createdAt.toDate();
        dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
    }
    if (dateTextEl && dateWrap) {
        if (dateStr) {
            dateTextEl.textContent = dateStr;
            dateWrap.style.display = 'flex';
        } else {
            dateWrap.style.display = 'none';
        }
    }

    if (titleEl) titleEl.textContent = post.title;
    if (excerptEl) excerptEl.textContent = post.excerpt;

    if (contentEl) {
        // Formázzuk a bekezdéseket biztonságosan
        const rawContent = post.content || '';
        const paragraphs = rawContent
            .split(/\n\s*\n/)
            .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
            .join('');
        contentEl.innerHTML = paragraphs;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeChildWelfareModal() {
    const modal = document.getElementById('childWelfareModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function initChildWelfareModalListeners() {
    const modal = document.getElementById('childWelfareModal');
    const closeBtn = document.getElementById('closeChildWelfareModal');
    if (!modal) return;

    if (closeBtn && !closeBtn._hasListener) {
        closeBtn.addEventListener('click', closeChildWelfareModal);
        closeBtn._hasListener = true;
    }

    if (!modal._hasOverlayListener) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeChildWelfareModal();
            }
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeChildWelfareModal();
            }
        });
        modal._hasOverlayListener = true;
    }
}

async function loadChildWelfarePosts() {
    const gridContainer = document.getElementById('child-welfare-posts-grid');
    if (!gridContainer) return;

    try {
        const postsRef = collection(db, 'child_welfare_posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            gridContainer.innerHTML = '<div style="text-align:center; padding: 2.5rem; width: 100%; grid-column: 1 / -1; color: var(--color-gray); background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"><p style="margin:0; font-size:1.05rem;">Jelenleg nincsenek feltöltött gyermekvédelmi bejegyzések.</p></div>';
            return;
        }

        gridContainer.innerHTML = '';
        window.childWelfarePostsMap = {};

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            window.childWelfarePostsMap[id] = data;

            let dateStr = '';
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
            }

            const imageUrl = data.imageUrl || 'images/global/Logo_BEZS_emblema.png';

            const card = document.createElement('article');
            card.className = 'child-welfare-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${data.title} - Bejegyzés megnyitása`);
            card.innerHTML = `
                <div class="child-welfare-card-img-wrap">
                    <img src="${imageUrl}" alt="${data.title.replace(/"/g, '&quot;')}" class="child-welfare-card-img" onerror="this.src='images/global/Logo_BEZS_emblema.png'">
                    <span class="child-welfare-card-badge">Gyermekvédelem</span>
                </div>
                <div class="child-welfare-card-body">
                    ${dateStr ? `
                    <div class="child-welfare-card-date">
                        <svg viewBox="0 0 448 512"><path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm128 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z"/></svg>
                        <span>${dateStr}</span>
                    </div>` : ''}
                    <h3 class="child-welfare-card-title">${data.title}</h3>
                    <p class="child-welfare-card-excerpt">${data.excerpt}</p>
                    <div class="child-welfare-card-footer">
                        <span class="child-welfare-card-btn">
                            Elolvasom
                            <svg viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                        </span>
                    </div>
                </div>
            `;

            // Kattintás esemény a modal megnyitásához
            card.addEventListener('click', () => {
                openChildWelfareModal(id);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openChildWelfareModal(id);
                }
            });

            gridContainer.appendChild(card);
        });

        initChildWelfareModalListeners();

    } catch (error) {
        console.error("Hiba a gyermekvédelmi bejegyzések betöltésekor:", error);
        gridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; width: 100%; grid-column: 1 / -1; color: red;">Hiba történt a bejegyzések betöltésekor.</div>';
    }
}

// Inicializálás, ha az oldal betöltött
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
    loadSponsors();
    loadNews();
    loadProjects();
    loadDonationGallery();
    loadChildWelfarePosts();
});


