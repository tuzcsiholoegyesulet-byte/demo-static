// js/galeria.js
import { db } from './auth.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

async function loadAlbums() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    try {
        const q = query(collection(db, "albums"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        let html = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('hu-HU') : '';
            const coverImage = (data.images && data.images.length > 0) ? data.images[0] : 'images/global/Logo_BEZS_emblema.png';
            const count = (data.images && data.images.length > 0) ? data.images.length : 0;
            
            const imagesJson = encodeURIComponent(JSON.stringify(data.images || []));

            html += `
            <div class="album-card" onclick="openAlbumViewer('${imagesJson}')" style="cursor: pointer; background: white; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s; position: relative;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="height: 200px; background: url('${coverImage}') center/cover; position: relative;">
                    <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        <svg style="width: 12px; height: 12px; fill: white; margin-right: 4px; vertical-align: text-bottom;" viewBox="0 0 512 512"><path d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10l-80 112L48 416V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>
                        ${count} fotó
                    </div>
                </div>
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: var(--color-dark-blue);">${data.title}</h3>
                    <span style="color: var(--color-teal); font-size: 0.9rem;">${dateStr}</span>
                </div>
            </div>
            `;
        });
        
        if (html === '') {
            container.innerHTML = '<div style="text-align:center; padding: 3rem; grid-column: 1 / -1;">Még nem töltöttek fel albumokat.</div>';
        } else {
            container.innerHTML = html;
        }

    } catch (error) {
        console.error("Hiba a galéria betöltésekor:", error);
        container.innerHTML = '<div style="text-align:center; padding: 3rem; color: red; grid-column: 1 / -1;">Hiba történt a galéria betöltése során.</div>';
    }
}

window.currentAlbumImages = [];
window.currentAlbumIndex = 0;

window.openAlbumViewer = function(imagesJsonEncoded) {
    try {
        const images = JSON.parse(decodeURIComponent(imagesJsonEncoded));
        if (!images || images.length === 0) return;
        
        window.currentAlbumImages = images;
        window.currentAlbumIndex = 0;
        
        // Előző modal törlése, ha véletlenül bennmaradt
        const oldModal = document.getElementById('album-viewer-modal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div id="album-viewer-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <button onclick="closeAlbumViewer()" style="position: absolute; top: 20px; right: 30px; background: none; border: none; color: white; font-size: 40px; cursor: pointer; z-index: 10000;">&times;</button>
                
                <div style="position: relative; max-width: 90%; max-height: 75vh; display: flex; align-items: center; justify-content: center;">
                    <button id="album-prev-btn" onclick="changeAlbumImage(-1)" style="position: absolute; left: 10px; background: rgba(0,0,0,0.5); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 30px; cursor: pointer; display: ${images.length > 1 ? 'flex' : 'none'}; align-items: center; justify-content: center; z-index: 10000; transition: background 0.3s; padding-bottom: 4px;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">&lsaquo;</button>
                    
                    <img id="album-viewer-main-img" src="${images[0]}" style="max-width: 100%; max-height: 75vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    
                    <button id="album-next-btn" onclick="changeAlbumImage(1)" style="position: absolute; right: 10px; background: rgba(0,0,0,0.5); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 30px; cursor: pointer; display: ${images.length > 1 ? 'flex' : 'none'}; align-items: center; justify-content: center; z-index: 10000; transition: background 0.3s; padding-bottom: 4px;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">&rsaquo;</button>
                </div>

                <div id="album-viewer-thumbnails" style="display: flex; gap: 10px; margin-top: 20px; overflow-x: auto; max-width: 90%; padding-bottom: 10px;">
                    ${images.map((img, idx) => `
                        <img id="album-thumb-${idx}" src="${img}" onclick="setAlbumImage(${idx})" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--color-orange, orange)' : 'transparent'}; transition: 0.3s;" onmouseover="if(window.currentAlbumIndex !== ${idx}) this.style.borderColor='white'" onmouseout="if(window.currentAlbumIndex !== ${idx}) this.style.borderColor='transparent'">
                    `).join('')}
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.addEventListener('keydown', handleAlbumViewerKeydown);
    } catch(e) {
        console.error(e);
    }
};

window.changeAlbumImage = function(direction) {
    let newIndex = window.currentAlbumIndex + direction;
    if (newIndex < 0) newIndex = window.currentAlbumImages.length - 1;
    if (newIndex >= window.currentAlbumImages.length) newIndex = 0;
    setAlbumImage(newIndex);
};

window.setAlbumImage = function(index) {
    if(index < 0 || index >= window.currentAlbumImages.length) return;
    window.currentAlbumIndex = index;
    
    const mainImg = document.getElementById('album-viewer-main-img');
    if(mainImg) mainImg.src = window.currentAlbumImages[index];
    
    for(let i = 0; i < window.currentAlbumImages.length; i++) {
        const thumb = document.getElementById(`album-thumb-${i}`);
        if(thumb) thumb.style.borderColor = (i === index) ? 'var(--color-orange, orange)' : 'transparent';
    }
};

window.closeAlbumViewer = function() {
    const modal = document.getElementById('album-viewer-modal');
    if (modal) modal.remove();
    document.removeEventListener('keydown', handleAlbumViewerKeydown);
};

function handleAlbumViewerKeydown(e) {
    if (e.key === 'ArrowLeft') {
        changeAlbumImage(-1);
    } else if (e.key === 'ArrowRight') {
        changeAlbumImage(1);
    } else if (e.key === 'Escape') {
        closeAlbumViewer();
    }
}

document.addEventListener('DOMContentLoaded', loadAlbums);
