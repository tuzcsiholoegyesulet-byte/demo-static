// js/hir.js
import { db } from './auth.js';
import { doc, getDoc, getDocs, collection, query, where, documentId } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get('id');

const container = document.getElementById('single-news-container');
const heroImage = document.getElementById('news-hero-image');
const heroTitle = document.getElementById('news-hero-title');

async function loadSingleNews() {
    if (!newsId) {
        showError("Nem található hír (hiányzó azonosító).");
        return;
    }

    try {
        const newsRef = doc(db, 'news', newsId);
        const newsSnap = await getDoc(newsRef);

        if (!newsSnap.exists()) {
            showError("A keresett hír nem található vagy törölték.");
            return;
        }

        const data = newsSnap.data();

        // Ha nincs publikálva, nem mutatjuk meg
        if (!data.published) {
            showError("Ez a hír jelenleg nem publikus.");
            return;
        }

        // Hero frissítése
        document.title = `${data.title} | Tűzcsiholó Egyesület`;
        heroTitle.textContent = data.title;
        if (data.imageUrl) {
            heroImage.src = data.imageUrl;
        }

        // Dátum formázása
        let dateStr = '';
        if (data.createdAt) {
            const date = data.createdAt.toDate();
            dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
        }

        // YouTube beágyazás (ha van)
        let youtubeHtml = '';
        if (data.youtubeUrl) {
            // Extraháljuk a videó ID-t
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = data.youtubeUrl.match(regExp);
            if (match && match[2].length === 11) {
                const videoId = match[2];
                youtubeHtml = `
                <div style="margin-top: 3rem; margin-bottom: 3rem; text-align: center;">
                    <iframe width="100%" height="450" style="max-width: 800px; border-radius: 12px; border: none; box-shadow: var(--shadow-sm);" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
                </div>`;
            }
        }

        // Albumok képeinek lekérése
        let galleryHtml = '';
        if (data.albumIds && data.albumIds.length > 0) {
            try {
                // Biztonságos IN lekérdezés: a Firestore az "in" feltételt max 10 elemre engedi.
                // Ha 10-nél több album van csatolva egy hírhez (ami ritka), akkor darabolni kell, 
                // de egy hírhez általában 1-2 album tartozik.
                const chunks = [];
                for (let i = 0; i < data.albumIds.length; i += 10) {
                    chunks.push(data.albumIds.slice(i, i + 10));
                }
                
                let allImages = [];
                
                for (const chunk of chunks) {
                    const albumsRef = collection(db, 'albums');
                    const q = query(albumsRef, where(documentId(), 'in', chunk));
                    const albumSnaps = await getDocs(q);
                    
                    albumSnaps.forEach(docSnap => {
                        const albumData = docSnap.data();
                        if (albumData.images && Array.isArray(albumData.images)) {
                            allImages = allImages.concat(albumData.images);
                        }
                    });
                }
                
                if (allImages.length > 0) {
                    galleryHtml = `
                    <div style="margin-top: 4rem;">
                        <h3 style="margin-bottom: 2rem; color: var(--color-dark-blue); font-size: 1.8rem; border-bottom: 2px solid var(--color-teal); padding-bottom: 0.5rem; display: inline-block;">Galéria (${allImages.length} fotó)</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                            ${allImages.map(imgUrl => `
                                <a href="${imgUrl}" target="_blank" style="display: block; aspect-ratio: 1; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
                                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                </a>
                            `).join('')}
                        </div>
                    </div>`;
                }
            } catch(e) {
                console.error("Hiba az albumok lekérésekor", e);
            }
        }

        // Fő tartalom összeállítása
        // Hozzáadjuk a Quill.js alap stílusait
        container.innerHTML = `
            <style>
              .quill-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
              .quill-content h1, .quill-content h2, .quill-content h3 { color: var(--color-dark-blue); margin-top: 2rem; }
              .quill-content a { color: var(--color-teal); text-decoration: underline; }
              .quill-content p { margin-bottom: 1rem; }
            </style>
            <span class="article-meta" style="color: var(--color-teal); font-weight: 500; margin-bottom: 1.5rem; display: block;">${dateStr}</span>
            <div class="quill-content" style="font-size: 1.15rem; line-height: 1.8; color: #333;">
                ${data.content || '<p>Nincs elérhető tartalom.</p>'}
            </div>
            ${youtubeHtml}
            ${galleryHtml}
        `;

    } catch (error) {
        console.error("Hiba a hír betöltésekor:", error);
        showError("Váratlan hiba történt a hír betöltése során.");
    }
}

function showError(msg) {
    heroTitle.textContent = "Hiba";
    container.innerHTML = `<div style="text-align:center; padding: 3rem; color: red;">${msg}</div>`;
}

document.addEventListener('DOMContentLoaded', loadSingleNews);
