import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, updateDoc, Timestamp, writeBatch, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0WEx-zQaYEZqDYdHnx32bjiXYhGhJ2iY",
  authDomain: "tuzcsiholoweb.firebaseapp.com",
  projectId: "tuzcsiholoweb",
  storageBucket: "tuzcsiholoweb.firebasestorage.app",
  messagingSenderId: "518169514425",
  appId: "1:518169514425:web:7f71160d4de48addcca668"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUserRole = null;

// Kijelentkezés
document.getElementById('btnAdminLogout').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch(error) {
        console.error(error);
    }
});

// Jogosultság ellenőrzése (Route Guard)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'editor')) {
                currentUserRole = userDoc.data().role;
                
                // Jogosult: betöltő képernyő eltüntetése
                document.getElementById('loadingScreen').style.display = 'none';
                
                // Név beállítása
                const nameSpan = document.getElementById('adminName');
                const roleLabel = currentUserRole === 'admin' ? 'Admin' : 'Szerkesztő';
                if (userDoc.data().firstname) {
                    nameSpan.textContent = `${userDoc.data().firstname} (${roleLabel})`;
                } else if (user.displayName) {
                    nameSpan.textContent = `${user.displayName} (${roleLabel})`;
                } else {
                    nameSpan.textContent = `${user.email} (${roleLabel})`;
                }
                
                // UI Inicializálása
                applyRBAC();
                initSidebar();
                initTabs();
                initAccordion();
                initForms();
                initQuill();
                loadAdminNews();
                loadAlbums();
                if(window.loadMediaList) window.loadMediaList();
                if(window.loadProjectsList) window.loadProjectsList();
            } else {
                // Be van jelentkezve, de nem admin/editor
                alert('Nincs jogosultságod megtekinteni ezt az oldalt.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error("Hiba a jogosultság ellenőrzésekor:", error);
            window.location.href = 'index.html';
        }
    } else {
        // Nincs bejelentkezve
        window.location.href = 'index.html';
    }
});

// Role-Based Access Control (RBAC) - Elemek elrejtése
function applyRBAC() {
    const restrictedElements = document.querySelectorAll('[data-role]');
    restrictedElements.forEach(el => {
        const allowedRoles = el.getAttribute('data-role').split(',');
        if (!allowedRoles.includes(currentUserRole)) {
            el.style.display = 'none';
        }
    });
}

// Oldalsáv (Sidebar) összecsukása/kinyitása
function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
}

// Tab (Nézet) váltó logika
function initTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item[data-target]');
    const views = document.querySelectorAll('.admin-view');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Aktív class cseréje
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Nézetek cseréje
            views.forEach(view => {
                if(view.id === targetId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}

// Accordion (Harmonika) logika
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            const parent = header.parentElement;
            
            // Ellenőrizzük, hogy a kattintott panel jelenleg nyitva van-e
            const isOpen = parent.classList.contains('open');
            
            // Bezárjuk az összes testvér (azonos szinten lévő) accordion-item-et
            const siblings = parent.parentElement.children;
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].classList.contains('accordion-item')) {
                    siblings[i].classList.remove('open');
                }
            }
            
            // Ha a kattintott panel eredetileg zárva volt, akkor most kinyitjuk
            if (!isOpen) {
                parent.classList.add('open');
            }
            
            e.stopPropagation();
        });
    });
}

// --- Albumok betöltése a checkboxokhoz ---
window.adminAlbumsList = [];

async function loadAlbums() {
    try {
        const q = query(collection(db, "albums"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const containerNew = document.getElementById('newsAlbumCheckboxes');
        const containerEdit = document.getElementById('editNewsAlbumCheckboxes');
        const listContainer = document.getElementById('admin-albums-list');
        
        let html = '';
        let listHtml = '';
        window.adminAlbumsList = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            window.adminAlbumsList.push({ id: docSnap.id, ...data });
            html += `
            <label class="checkbox-list-item">
                <input type="checkbox" value="${docSnap.id}"> ${data.title}
            </label>
            `;
            
            const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleDateString('hu-HU') : '';
            const imgCount = data.images ? data.images.length : 0;
            const coverImage = (data.images && data.images.length > 0) ? data.images[0] : 'images/global/Logo_BEZS_emblema.png';
            const imagesJsonEncoded = encodeURIComponent(JSON.stringify(data.images || []));

            listHtml += `
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; margin-bottom: 10px; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; gap: 15px; align-items: center; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1" onclick="openAlbumViewer('${imagesJsonEncoded}')">
                    <img src="${coverImage}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                    <div>
                        <h4 style="margin:0 0 5px 0; color: var(--color-dark-blue);">${data.title}</h4>
                        <div style="font-size: 12px; color: var(--color-gray);">${dateStr} - ${imgCount} kép (Kattints a megtekintéshez)</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="admin-btn" style="background-color: var(--color-teal); padding: 6px 12px; font-size: 0.85rem;" onclick="editAlbum('${docSnap.id}')">Szerkesztés</button>
                    <button class="admin-btn" style="background-color: #dc3545; padding: 6px 12px; font-size: 0.85rem;" onclick="deleteAlbum('${docSnap.id}')">Törlés</button>
                </div>
            </div>
            `;
        });
        
        if (html === '') html = '<div style="color:var(--color-gray); font-size:14px;">Még nincsenek albumok.</div>';
        if (listHtml === '') listHtml = '<div style="color:var(--color-gray); font-size:14px;">Még nincsenek albumok.</div>';
        
        if (containerNew) containerNew.innerHTML = html;
        if (containerEdit) containerEdit.innerHTML = html;
        if (listContainer) listContainer.innerHTML = listHtml;
    } catch (error) {
        console.error("Hiba az albumok betöltésekor:", error);
    }
}

window.deleteAlbum = async function(id) {
    if(confirm("Biztosan törölni szeretnéd ezt az albumot? Ez a művelet nem vonható vissza.")) {
        try {
            await deleteDoc(doc(db, "albums", id));
            loadAlbums();
            alert("Album sikeresen törölve!");
        } catch (e) {
            console.error("Hiba az album törlésekor:", e);
            alert("Hiba a törlés során!");
        }
    }
}

// --- Album Szerkesztése ---
window.editAlbum = function(id) {
    const album = window.adminAlbumsList.find(a => a.id === id);
    if(!album) return;
    
    const oldModal = document.getElementById('edit-album-modal');
    if(oldModal) oldModal.remove();
    
    const modalHtml = `
    <div id="edit-album-modal" style="position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center; overflow-y:auto; padding: 20px;">
        <div style="position:relative; background:white; padding:30px; border-radius:12px; width:100%; max-width:800px; max-height:90vh; overflow-y:auto; box-shadow: 0 5px 30px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('edit-album-modal').remove()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:28px; font-weight:bold; color:#aaa; cursor:pointer; transition:0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#aaa'">&times;</button>
            
            <h3 style="margin-bottom: 20px; color: var(--color-dark-blue);">Album szerkesztése</h3>
            <div class="admin-form-group">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Album Neve</label>
                <input type="text" id="editAlbumName" class="admin-form-control" value="${album.title.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 20px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Jelenlegi képek (Kattints az X-re a törléshez)</label>
                <div id="edit-album-images-grid" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    <!-- JS tölti ki -->
                </div>
            </div>
            <div class="admin-form-group" style="margin-top: 20px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Új képek hozzáadása</label>
                <input type="file" id="editAlbumNewImages" class="admin-form-control" accept="image/*" multiple style="width:100%; box-sizing:border-box;">
            </div>
            <div style="display:flex; gap:10px; margin-top:30px;">
                <button id="btnSaveAlbumChanges" class="admin-btn" style="background-color:var(--color-teal); color:white;" onclick="saveAlbumChanges('${id}')">Módosítások mentése</button>
                <button class="admin-btn" style="background-color:#6c757d; color:white;" onclick="document.getElementById('edit-album-modal').remove()">Mégse</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    window.currentEditingAlbumImages = [...(album.images || [])];
    renderEditingAlbumImages();
};

window.renderEditingAlbumImages = function() {
    const container = document.getElementById('edit-album-images-grid');
    if(!container) return;
    
    let html = '';
    window.currentEditingAlbumImages.forEach((url, idx) => {
        html += `
        <div style="position:relative; width:100px; height:100px;">
            <img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border: 1px solid #ccc;">
            <button type="button" onclick="removeImageFromEditing(${idx})" style="position:absolute; top:-8px; right:-8px; background:red; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">X</button>
        </div>
        `;
    });
    if(window.currentEditingAlbumImages.length === 0) {
        html = '<span style="color:var(--color-gray); font-size:14px; font-style: italic;">Nincsenek képek az albumban.</span>';
    }
    container.innerHTML = html;
};

window.removeImageFromEditing = function(idx) {
    if(confirm("Biztosan törlöd ezt a képet az albumból? A változás a 'Mentés' gomb megnyomása után lesz végleges.")) {
        window.currentEditingAlbumImages.splice(idx, 1);
        renderEditingAlbumImages();
    }
};

window.saveAlbumChanges = async function(id) {
    const btn = document.getElementById('btnSaveAlbumChanges');
    if(btn) {
        btn.textContent = "Mentés folyamatban...";
        btn.disabled = true;
    }
    
    try {
        const newTitle = document.getElementById('editAlbumName').value;
        const newImagesInput = document.getElementById('editAlbumNewImages');
        const finalImages = [...window.currentEditingAlbumImages];
        
        if (newImagesInput.files.length > 0) {
            for (let i = 0; i < newImagesInput.files.length; i++) {
                const file = newImagesInput.files[i];
                const sRef = ref(storage, `albums/${Date.now()}_optimized_${i}.webp`);
                const snap = await uploadBytes(sRef, await compressImage(file));
                const url = await getDownloadURL(snap.ref);
                finalImages.push(url);
            }
        }
        
        await updateDoc(doc(db, "albums", id), {
            title: newTitle,
            images: finalImages
        });
        
        document.getElementById('edit-album-modal').remove();
        loadAlbums();
        alert("Album sikeresen frissítve!");
    } catch (e) {
        console.error("Hiba az album szerkesztésekor:", e);
        alert("Hiba a mentés során!");
        if(btn) {
            btn.textContent = "Módosítások mentése";
            btn.disabled = false;
        }
    }
};

// --- Album Nézegető (Adminhoz) ---
window.currentAlbumImages = [];
window.currentAlbumIndex = 0;

window.openAlbumViewer = function(imagesJsonEncoded) {
    try {
        const images = JSON.parse(decodeURIComponent(imagesJsonEncoded));
        if (!images || images.length === 0) return;
        
        window.currentAlbumImages = images;
        window.currentAlbumIndex = 0;
        
        const oldModal = document.getElementById('album-viewer-modal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div id="album-viewer-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center;">
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

// Dinamikusan létrehozzuk a gombot, ha a HTML cache miatt nem lenne ott
const listContainer = document.getElementById('admin-albums-list');
if (listContainer && !document.getElementById('btnGenerateTestAlbums')) {
    const btn = document.createElement('button');
    btn.id = 'btnGenerateTestAlbums';
    btn.className = 'admin-btn';
    btn.style = 'background-color: var(--color-orange); padding: 0.5rem 1rem; font-size: 0.9rem; margin-bottom: 15px; display: block; margin-left: auto;';
    btn.textContent = '+ 2 Teszt Album Generálása';
    listContainer.parentNode.insertBefore(btn, listContainer);
}

const btnGenAlbums = document.getElementById('btnGenerateTestAlbums');
if (btnGenAlbums) {
    btnGenAlbums.addEventListener('click', async () => {
        if (!confirm("Biztosan generálsz 2 teszt albumot (5-5 képpel)?")) return;
        
        const btn = btnGenAlbums;
        const originalText = btn.textContent;
        btn.textContent = "Generálás folyamatban...";
        btn.disabled = true;
        
        try {
            const album1Images = [
                "https://picsum.photos/800/600?random=1",
                "https://picsum.photos/800/600?random=2",
                "https://picsum.photos/800/600?random=3",
                "https://picsum.photos/800/600?random=4",
                "https://picsum.photos/800/600?random=5"
            ];
            await addDoc(collection(db, "albums"), {
                title: "Nyári Tábor Teszt 2026",
                images: album1Images,
                createdAt: serverTimestamp()
            });
            
            const album2Images = [
                "https://picsum.photos/800/600?random=6",
                "https://picsum.photos/800/600?random=7",
                "https://picsum.photos/800/600?random=8",
                "https://picsum.photos/800/600?random=9",
                "https://picsum.photos/800/600?random=10"
            ];
            await addDoc(collection(db, "albums"), {
                title: "Adományosztás Teszt 2026",
                images: album2Images,
                createdAt: serverTimestamp()
            });
            
            loadAlbums();
            alert("Sikeresen legeneráltuk a 2 teszt albumot!");
        } catch (err) {
            console.error("Hiba a teszt albumok létrehozásakor:", err);
            alert("Hiba történt!");
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// --- Quill.js Szerkesztők ---
function initQuill() {
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ];

    if (document.getElementById('newsContentEditor')) {
        window.quillNews = new Quill('#newsContentEditor', { theme: 'snow', modules: { toolbar: toolbarOptions } });
        window.quillNews.getModule('toolbar').addHandler('image', function() { selectLocalImage(window.quillNews); });
    }
    
    if (document.getElementById('editNewsContentEditor')) {
        window.quillEditNews = new Quill('#editNewsContentEditor', { theme: 'snow', modules: { toolbar: toolbarOptions } });
        window.quillEditNews.getModule('toolbar').addHandler('image', function() { selectLocalImage(window.quillEditNews); });
    }
}

async function selectLocalImage(quillInstance) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (/^image\//.test(file.type)) {
            try {
                const storageRef = ref(storage, `news_inline/${Date.now()}_optimized.webp`);
                const snapshot = await uploadBytes(storageRef, await compressImage(file));
                const url = await getDownloadURL(snapshot.ref);
                const range = quillInstance.getSelection(true);
                quillInstance.insertEmbed(range.index, 'image', url);
                quillInstance.setSelection(range.index + 1);
            } catch(e) {
                console.error("Kép feltöltési hiba", e);
                alert("Hiba történt a beágyazott kép feltöltésekor.");
            }
        }
    };
}

// Űrlapok beküldésének kezelése
function initForms() {
        // Hírek kép előnézet
    const newsImgInput = document.getElementById('newsImage');
    const newsPreviewImg = document.getElementById('newsPreviewImg');
    const newsPreviewText = document.getElementById('newsPreviewText');
    if (newsImgInput) {
        newsImgInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (onloadEvent) => {
                    newsPreviewImg.src = onloadEvent.target.result;
                    newsPreviewImg.style.display = 'block';
                    if (newsPreviewText) newsPreviewText.style.display = 'none';
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // 1. Hírek feltöltése
    const formNews = document.getElementById('form-news');
    if (formNews) {
        formNews.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formNews.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés folyamatban...';
            btn.disabled = true;
            
            try {
                let imageUrl = '';
                const fileInput = document.getElementById('newsImage');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const storageRef = ref(storage, `news/${Date.now()}_optimized.webp`);
                    const snapshot = await uploadBytes(storageRef, await compressImage(file));
                    imageUrl = await getDownloadURL(snapshot.ref);
                }
                
                const dateInputValue = document.getElementById('newsDate').value;
                let finalDate = serverTimestamp();
                if (dateInputValue) {
                    finalDate = Timestamp.fromDate(new Date(dateInputValue));
                }
                
                // Album ID-k összegyűjtése
                const selectedAlbums = [];
                document.querySelectorAll('#newsAlbumCheckboxes input[type="checkbox"]:checked').forEach(cb => {
                    selectedAlbums.push(cb.value);
                });

                await addDoc(collection(db, "news"), {
                    title: document.getElementById('newsTitle').value,
                    excerpt: document.getElementById('newsExcerpt').value,
                    content: window.quillNews.root.innerHTML,
                    imageUrl: imageUrl,
                    albumIds: selectedAlbums,
                    youtubeUrl: document.getElementById('newsYoutubeLink').value || '',
                    published: document.getElementById('newsPublished').checked,
                    createdAt: finalDate,
                    authorRole: currentUserRole
                });
                
                alert('Hír sikeresen feltöltve!');
                formNews.reset();
                if (typeof loadAdminNews === 'function') {
                    loadAdminNews(); // Lista azonnali frissítése
                }
            } catch (error) {
                console.error("Hiba a hír mentésekor:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Mentés és Feltöltés';
                btn.disabled = false;
            }
        });
    }

    // 2. Pénzügyi beszámoló feltöltése
    // Átláthatóság (Mappák és Dokumentumok) lista és betöltés
    window.loadTransparencyDocs = async function() {
        const listContainer = document.getElementById('admin-transparency-list');
        const folderSelect = document.getElementById('transparencyFolderSelect');
        if (!listContainer) return;
        
        try {
            // Mappák lekérése
            const foldersQ = query(collection(db, "transparency_folders"), orderBy("createdAt", "desc"));
            const foldersSnap = await getDocs(foldersQ);
            
            // Dokumentumok lekérése
            const docsQ = query(collection(db, "transparency"), orderBy("createdAt", "desc"));
            const docsSnap = await getDocs(docsQ);
            
            const folders = [];
            foldersSnap.forEach(doc => folders.push({ id: doc.id, ...doc.data(), files: [] }));
            
            // Ha van régi dokumentum (amiben még 'year' volt, folderId helyett), azt berakjuk egy "Egyéb" mappába
            let legacyFiles = [];
            
            docsSnap.forEach(docSnap => {
                const data = docSnap.data();
                const id = docSnap.id;
                
                if (data.folderId) {
                    const folder = folders.find(f => f.id === data.folderId);
                    if (folder) {
                        folder.files.push({ id, ...data });
                    } else {
                        legacyFiles.push({ id, ...data });
                    }
                } else if (data.year) {
                    legacyFiles.push({ id, ...data, name: data.name + ` (${data.year})` });
                } else {
                    legacyFiles.push({ id, ...data });
                }
            });
            
            // Select feltöltése
            if (folderSelect) {
                folderSelect.innerHTML = '<option value="">-- Válassz mappát --</option>';
                folders.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.id;
                    opt.textContent = f.name;
                    folderSelect.appendChild(opt);
                });
            }
            
            listContainer.innerHTML = '';
            
            if (folders.length === 0 && legacyFiles.length === 0) {
                listContainer.innerHTML = '<p style="color:var(--color-gray);">Még nincs feltöltött mappa vagy dokumentum.</p>';
                return;
            }
            
            let html = '<div class="custom-accordion">';
            
            // Mappák megjelenítése
            folders.forEach(folder => {
                html += `
                <div class="accordion-item sub-accordion" style="margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    <div class="accordion-header" style="background: #f8f9fa; padding: 10px 15px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap: 10px; flex: 1;">
                            <span style="font-weight:bold; color:var(--color-dark-blue); font-size:1.1rem;">📁 ${folder.name}</span>
                            <svg viewBox="0 0 320 512" style="width: 12px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="edit-folder-btn" data-id="${folder.id}" data-name="${folder.name}" style="background: transparent; border: 1px solid var(--color-teal); color: var(--color-teal); padding: 5px 10px; border-radius: 4px; cursor: pointer;">Átnevezés</button>
                            <button class="delete-folder-btn" data-id="${folder.id}" style="background: transparent; border: 1px solid var(--color-red); color: var(--color-red); padding: 5px 10px; border-radius: 4px; cursor: pointer;">Törlés</button>
                        </div>
                    </div>
                    <div class="accordion-body" style="background: #fff; border-top: 1px solid #ddd;">
                `;
                
                if (folder.files.length === 0) {
                    html += `<p style="color:#666; margin:0;">Üres mappa.</p>`;
                } else {
                    html += `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">`;
                    folder.files.forEach(doc => {
                        html += `
                                <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fff; border: 1px solid #eee; border-radius: 4px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <svg viewBox="0 0 384 512" style="width: 15px; fill: var(--color-teal);"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>
                                        <a href="${doc.fileUrl}" target="_blank" style="color: var(--color-dark-blue); text-decoration: none; font-weight: 500;">${doc.name}</a>
                                    </div>
                                    <div style="display: flex; gap: 10px;">
                                        <button class="edit-transparency-btn" data-id="${doc.id}" data-name="${doc.name}" style="background: transparent; border: 1px solid var(--color-teal); color: var(--color-teal); padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Átnevezés</button>
                                        <button class="delete-transparency-btn" data-id="${doc.id}" data-url="${doc.fileUrl}" style="background: transparent; border: 1px solid var(--color-red); color: var(--color-red); padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Törlés</button>
                                    </div>
                                </li>
                        `;
                    });
                    html += `</ul>`;
                }
                html += `</div></div>`;
            });

            // Legacy/Egyéb
            if (legacyFiles.length > 0) {
                html += `
                <div class="accordion-item sub-accordion" style="margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    <div class="accordion-header" style="background: #f8f9fa; padding: 10px 15px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <span style="font-weight:bold; color:var(--color-dark-blue); font-size:1.1rem;">📁 Régi Dokumentumok (Mappa nélkül)</span>
                            <svg viewBox="0 0 320 512" style="width: 12px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>
                        </div>
                    </div>
                    <div class="accordion-body" style="background: #fff; border-top: 1px solid #ddd;">
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                `;
                legacyFiles.forEach(doc => {
                    html += `
                            <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fff; border: 1px solid #eee; border-radius: 4px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <svg viewBox="0 0 384 512" style="width: 15px; fill: var(--color-teal);"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>
                                    <a href="${doc.fileUrl}" target="_blank" style="color: var(--color-dark-blue); text-decoration: none; font-weight: 500;">${doc.name}</a>
                                </div>
                                <button class="delete-transparency-btn" data-id="${doc.id}" data-url="${doc.fileUrl}" style="background: transparent; border: 1px solid var(--color-red); color: var(--color-red); padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Törlés</button>
                            </li>
                    `;
                });
                html += `</ul></div></div>`;
            }
            
            html += '</div>';
            listContainer.innerHTML = html;
            
            // Accordion click
            const headers = listContainer.querySelectorAll('.accordion-header');
            headers.forEach(header => {
                header.addEventListener('click', function(e) {
                    if (e.target.tagName.toLowerCase() === 'button') return;
                    
                    const parentItem = this.parentElement;
                    const isOpen = parentItem.classList.contains('open');
                    
                    // Bezárjuk az összes többit
                    listContainer.querySelectorAll('.accordion-item').forEach(item => {
                        item.classList.remove('open');
                    });

                    if (!isOpen) {
                        parentItem.classList.add('open');
                    }
                });
            });
            
            // Fájl törlés
            const deleteBtns = listContainer.querySelectorAll('.delete-transparency-btn');
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    if (confirm('Biztosan törölni szeretnéd ezt a dokumentumot?')) {
                        const id = this.getAttribute('data-id');
                        const url = this.getAttribute('data-url');
                        try {
                            await deleteDoc(doc(db, 'transparency', id));
                            if (url && url.includes('firebasestorage')) {
                                try { await deleteObject(ref(storage, url)); } catch(err) {}
                            }
                            window.loadTransparencyDocs();
                        } catch(err) {
                            console.error(err);
                            alert('Hiba a törlésnél.');
                        }
                    }
                });
            });

            // Mappa törlés
            const deleteFolderBtns = listContainer.querySelectorAll('.delete-folder-btn');
            deleteFolderBtns.forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    if (confirm('Biztosan törlöd a mappát? (A benne lévő dokumentumok törlése manuális.)')) {
                        const id = this.getAttribute('data-id');
                        try {
                            await deleteDoc(doc(db, 'transparency_folders', id));
                            window.loadTransparencyDocs();
                        } catch(err) {
                            console.error(err);
                            alert('Hiba a mappa törlésénél.');
                        }
                    }
                });
            });
            
            // Fájl átnevezés
            const editBtns = listContainer.querySelectorAll('.edit-transparency-btn');
            editBtns.forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const oldName = this.getAttribute('data-name');
                    const newName = prompt('Add meg a dokumentum új nevét:', oldName);
                    if (newName && newName.trim() !== '' && newName !== oldName) {
                        try {
                            await updateDoc(doc(db, 'transparency', id), {
                                name: newName.trim()
                            });
                            window.loadTransparencyDocs();
                        } catch(err) {
                            console.error(err);
                            alert('Hiba az átnevezésnél.');
                        }
                    }
                });
            });

            // Mappa átnevezés
            const editFolderBtns = listContainer.querySelectorAll('.edit-folder-btn');
            editFolderBtns.forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const oldName = this.getAttribute('data-name');
                    const newName = prompt('Add meg a mappa új nevét:', oldName);
                    if (newName && newName.trim() !== '' && newName !== oldName) {
                        try {
                            await updateDoc(doc(db, 'transparency_folders', id), {
                                name: newName.trim()
                            });
                            // Update all documents within this folder to have the new folderName
                            const q = query(collection(db, "transparency"), where("folderId", "==", id));
                            const querySnapshot = await getDocs(q);
                            const batch = writeBatch(db);
                            querySnapshot.forEach((d) => {
                                batch.update(doc(db, 'transparency', d.id), { folderName: newName.trim() });
                            });
                            await batch.commit();
                            
                            window.loadTransparencyDocs();
                        } catch(err) {
                            console.error(err);
                            alert('Hiba az átnevezésnél.');
                        }
                    }
                });
            });
            
        } catch(error) {
            console.error("Hiba a mappák/dokumentumok betöltésekor:", error);
        }
    };
    
    // Kezdeti betöltés
    if (document.getElementById('admin-transparency-list')) {
        setTimeout(() => window.loadTransparencyDocs(), 1000);
    }

    // ÚJ MAPPA LÉTREHOZÁS
    const formTransparencyFolder = document.getElementById('form-transparency-folder');
    if (formTransparencyFolder) {
        formTransparencyFolder.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formTransparencyFolder.querySelector('button[type="submit"]');
            btn.textContent = '...';
            btn.disabled = true;
            try {
                await addDoc(collection(db, "transparency_folders"), {
                    name: document.getElementById('transparencyFolderName').value,
                    createdAt: serverTimestamp()
                });
                formTransparencyFolder.reset();
                if (window.loadTransparencyDocs) window.loadTransparencyDocs();
            } catch (error) {
                console.error("Hiba a mappa mentésekor:", error);
                alert("Hiba történt.");
            } finally {
                btn.textContent = 'Létrehozás';
                btn.disabled = false;
            }
        });
    }

    // DOKUMENTUM FELTÖLTÉSE
    const formTransparency = document.getElementById('form-transparency');
    if (formTransparency) {
        formTransparency.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formTransparency.querySelector('button[type="submit"]');
            btn.textContent = 'Feltöltés folyamatban...';
            btn.disabled = true;
            
            try {
                const folderSelect = document.getElementById('transparencyFolderSelect');
                const selectedFolderId = folderSelect.value;
                const selectedFolderName = folderSelect.options[folderSelect.selectedIndex].text;
                
                const fileInput = document.getElementById('transparencyFile');
                const file = fileInput.files[0];
                const storageRef = ref(storage, `transparency/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "transparency"), {
                    folderId: selectedFolderId,
                    folderName: selectedFolderName,
                    name: document.getElementById('transparencyName').value,
                    fileUrl: fileUrl,
                    createdAt: serverTimestamp()
                });
                
                alert('Beszámoló sikeresen feltöltve!');
                formTransparency.reset();
                if (window.loadTransparencyDocs) window.loadTransparencyDocs();
            } catch (error) {
                console.error("Hiba a beszámoló mentésekor:", error);
                alert("Hiba történt a feltöltés során.");
            } finally {
                btn.textContent = 'Dokumentum Mentése';
                btn.disabled = false;
            }
        });
    }

    // 3. Média megjelenés (Rólunk írták)
    const formMedia = document.getElementById('form-media');
    if (formMedia) {
        formMedia.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formMedia.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés folyamatban...';
            btn.disabled = true;
            
            try {
                let imageUrl = '';
                const imageInput = document.getElementById('mediaImage');
                if (imageInput && imageInput.files.length > 0) {
                    const file = imageInput.files[0];
                    const sRef = ref(storage, `media/${Date.now()}_optimized.webp`);
                    const snap = await uploadBytes(sRef, await compressImage(file));
                    imageUrl = await getDownloadURL(snap.ref);
                }
                
                await addDoc(collection(db, "media"), {
                    title: document.getElementById('mediaTitle').value,
                    source: document.getElementById('mediaSource').value,
                    link: document.getElementById('mediaLink').value,
                    date: document.getElementById('mediaDate').value,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                
                alert('Média megjelenés sikeresen mentve!');
                formMedia.reset();
                if(window.loadMediaList) window.loadMediaList();
            } catch (error) {
                console.error("Hiba a média mentésekor:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Média Mentése';
                btn.disabled = false;
            }
        });
    }

window.adminMediaList = [];

window.loadMediaList = async function() {
    try {
        const q = query(collection(db, "media"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const listContainer = document.getElementById('admin-media-list');
        if (!listContainer) return;
        
        let listHtml = '';
        window.adminMediaList = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            window.adminMediaList.push({ id: docSnap.id, ...data });
            
            const coverImage = data.imageUrl ? data.imageUrl : 'images/global/Logo_BEZS_emblema.png';
            
            listHtml += `
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; margin-bottom: 10px; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <img src="${coverImage}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                    <div>
                        <h4 style="margin:0 0 5px 0; color: var(--color-dark-blue);">${data.title}</h4>
                        <div style="font-size: 12px; color: var(--color-gray);">${data.date} - ${data.source}</div>
                        <div style="font-size: 12px; margin-top: 5px;"><a href="${data.link}" target="_blank" style="color: var(--color-teal); text-decoration: none;">Link megnyitása</a></div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="admin-btn" style="background-color: var(--color-teal); padding: 6px 12px; font-size: 0.85rem; color: white;" onclick="editMedia('${docSnap.id}')">Szerkesztés</button>
                    <button class="admin-btn" style="background-color: #dc3545; padding: 6px 12px; font-size: 0.85rem; color: white;" onclick="deleteMedia('${docSnap.id}')">Törlés</button>
                </div>
            </div>
            `;
        });
        
        if (listHtml === '') listHtml = '<div style="color:var(--color-gray); font-size:14px;">Még nincsenek média megjelenések.</div>';
        listContainer.innerHTML = listHtml;
    } catch (e) {
        console.error("Hiba a média betöltésekor:", e);
    }
};

window.deleteMedia = async function(id) {
    if(confirm("Biztosan törölni szeretnéd ezt a média megjelenést?")) {
        try {
            await deleteDoc(doc(db, "media", id));
            window.loadMediaList();
            alert("Sikeresen törölve!");
        } catch (e) {
            console.error(e);
            alert("Hiba a törlés során!");
        }
    }
};

window.editMedia = function(id) {
    const media = window.adminMediaList.find(m => m.id === id);
    if(!media) return;
    
    const oldModal = document.getElementById('edit-media-modal');
    if(oldModal) oldModal.remove();
    
    const modalHtml = `
    <div id="edit-media-modal" style="position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center; overflow-y:auto; padding: 20px;">
        <div style="position:relative; background:white; padding:30px; border-radius:12px; width:100%; max-width:800px; max-height:90vh; overflow-y:auto; box-shadow: 0 5px 30px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('edit-media-modal').remove()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:28px; font-weight:bold; color:#aaa; cursor:pointer; transition:0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#aaa'">&times;</button>
            
            <h3 style="margin-bottom: 20px; color: var(--color-dark-blue);">Média megjelenés szerkesztése</h3>
            <div class="admin-form-group">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Cikk Címe</label>
                <input type="text" id="editMediaTitle" class="admin-form-control" value="${media.title.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Médium neve</label>
                <input type="text" id="editMediaSource" class="admin-form-control" value="${media.source.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Link (URL)</label>
                <input type="url" id="editMediaLink" class="admin-form-control" value="${media.link.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Megjelenés dátuma</label>
                <input type="date" id="editMediaDate" class="admin-form-control" value="${media.date}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Új borítókép feltöltése (opcionális, ha nem választasz, marad a régi)</label>
                <input type="file" id="editMediaImage" class="admin-form-control" accept="image/*" style="width:100%; box-sizing:border-box;">
            </div>
            <div style="display:flex; gap:10px; margin-top:30px;">
                <button id="btnSaveMediaChanges" class="admin-btn" style="background-color:var(--color-teal); color:white;" onclick="saveMediaChanges('${id}')">Módosítások mentése</button>
                <button class="admin-btn" style="background-color:#6c757d; color:white;" onclick="document.getElementById('edit-media-modal').remove()">Mégse</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveMediaChanges = async function(id) {
    const btn = document.getElementById('btnSaveMediaChanges');
    if(btn) {
        btn.textContent = "Mentés folyamatban...";
        btn.disabled = true;
    }
    
    try {
        const media = window.adminMediaList.find(m => m.id === id);
        let imageUrl = media.imageUrl || '';
        
        const imageInput = document.getElementById('editMediaImage');
        if (imageInput && imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const sRef = ref(storage, `media/${Date.now()}_optimized.webp`);
            const snap = await uploadBytes(sRef, await compressImage(file));
            imageUrl = await getDownloadURL(snap.ref);
        }
        
        await updateDoc(doc(db, "media", id), {
            title: document.getElementById('editMediaTitle').value,
            source: document.getElementById('editMediaSource').value,
            link: document.getElementById('editMediaLink').value,
            date: document.getElementById('editMediaDate').value,
            imageUrl: imageUrl
        });
        
        document.getElementById('edit-media-modal').remove();
        window.loadMediaList();
        alert("Sikeresen frissítve!");
    } catch (e) {
        console.error(e);
        alert("Hiba a mentés során!");
        if(btn) {
            btn.textContent = "Módosítások mentése";
            btn.disabled = false;
        }
    }
};
    // 4. Csapatunk (Munkatárs)
    const teamForms = document.querySelectorAll('.form-team');
    teamForms.forEach(form => {
        const imgInput = form.querySelector('input[name="teamImage"]');
        const previewImg = form.querySelector('.preview-img');
        const previewText = form.querySelector('.preview-text');
        
        if (imgInput) {
            imgInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (onloadEvent) => {
                        previewImg.src = onloadEvent.target.result;
                        previewImg.style.display = 'block';
                        if (previewText) previewText.style.display = 'none';
                    }
                    reader.readAsDataURL(e.target.files[0]);
                } else {
                    previewImg.src = '';
                    previewImg.style.display = 'none';
                    if (previewText) previewText.style.display = 'block';
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                const file = imgInput.files[0];
                let imageUrl = '';
                if (file) {
                    const storageRef = ref(storage, `team/${Date.now()}_optimized.webp`);
                    const snapshot = await uploadBytes(storageRef, await compressImage(file));
                    imageUrl = await getDownloadURL(snapshot.ref);
                }
                
                const category = form.getAttribute('data-category');
                
                await addDoc(collection(db, "team"), {
                    name: form.querySelector('input[name="teamName"]').value,
                    nickname: form.querySelector('input[name="teamNickname"]').value,
                    role: form.querySelector('input[name="teamRole"]').value,
                    phone: form.querySelector('input[name="teamPhone"]').value,
                    email: form.querySelector('input[name="teamEmail"]').value,
                    order: parseInt(form.querySelector('select[name="teamOrder"]').value) || 99,
                    description: form.querySelector('textarea[name="teamDescription"]').value,
                    category: category,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                alert('Sikeresen mentve!');
                seedAndLoadTeamMembers();
                form.reset();
                if (previewImg) {
                    previewImg.src = '';
                    previewImg.style.display = 'none';
                }
                if (previewText) previewText.style.display = 'block';
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            }
        });
    });

    
    // Seed and Load Team Members
    async function seedAndLoadTeamMembers() {
        const teamRef = collection(db, 'team');
        const q = query(teamRef, orderBy('order', 'asc'));
        let snapshot = await getDocs(q);
        
        // Seeding logic for the two test members if db is empty
        if (snapshot.empty) {
            console.log("Seeding test members...");
            await addDoc(teamRef, {
                name: "Illésné Áncsán Aranka",
                nickname: "Aranka",
                role: "elnök, szakmai vezető",
                phone: "+36 30 123 4567",
                email: "email@pelda.hu",
                order: 1,
                description: "Egy véletlen folytán sodródtam a gyermekotthonok világába, 18 évesen. A főiskola előtt képesítés nélküli nevelőként kezdtem el dolgozni egy leány nevelőotthonban. Négy évesen elveszítettem az édesanyámat és 17 évesen az édesapámat is. Talán ezért volt, hogy nagyon megérintett az ott élő gyerekek sorsa és hamar egyértelművé vált a számomra, hogy a gyermekvédelem lesz a hivatásom. Tanár, népművelő, közoktatásvezető és szociálpolitikus végzettségem van. 26 évig dolgoztam a tiszadobi gyermekotthonban, először nevelőként, később pedig vezetőként. 2012-től a kecskeméti SOS Gyermekfaluba kerültem. A munkám mellett mindig fontos volt számomra a civil tevékenység, több egyesület, szociális szövetkezet munkáját segítettem. Azonban minden tevékenységem mögött a mozgatórugó a gyermekvédelemmel érintettek segítése volt. Meggyőződésem, hogy a nehéz élethelyzetből kimozdítani az embereket a foglalkoztatással és az oktatással lehet, de csak akkor, ha az érintettek is tenni akarnak önmagukért.",
                category: "csapattag",
                imageUrl: "images/team/Illesne-Ancsan-Aranka.jpg",
                createdAt: serverTimestamp()
            });
            await addDoc(teamRef, {
                name: "Oláh Ibolya",
                nickname: "Ibolya",
                role: "alapító tag",
                phone: "",
                email: "",
                order: 1,
                description: "Egy szabolcsi kis faluból származom. Édesanyám 18 éves alig múlt, amikor megszülettem. Ő akkor már egyedül volt és hiába kért segítséget a rokonoktól, senki nem fogadott be bennünket. Így nem volt más választása, beadott engem egy csecsemőotthonba, hogy dolgozni tudjon. Évekig tartott, hogy rendezze az életét és megteremtse annak a feltételét, hogy magához vegyen. De én akkor már nem tudtam őt elfogadni. Egyik nevelőszülőtől a másikhoz kerültem, majd jöttek sorra a nevelőotthonok. Nem élveztem különösebben az életemet, haragudtam a világra, édesanyámra is. Szerencsére megtaláltam a boldogságot a zene világában. Az éneklés mindig vigaszt nyújtott, és barátokat is szereztem általa. A Megasztár egy új világot nyitott meg előttem, ami eleinte nagyon idegen volt számomra. Nem értettem, hogy mi történik körülöttem, de mára sok dolgot megtanultam. Szerencsém volt, mert sok nagyszerű emberrel hozott össze a sors, kiváló zenészekkel, rendezőkkel, költőkkel, akiktől lehetőségem volt tanulni. Azt azonban nem felejtettem el, hogy honnan jöttem. Fontosak nekem a sorstársaim. Ha segíthetek, boldogan teszem.",
                category: "tovabbi_tag",
                imageUrl: "images/team/Olah-Ibolya.jpg",
                createdAt: serverTimestamp()
            });
            snapshot = await getDocs(q);
        }

        window.teamMembersMap = {};
        const listCsapat = document.getElementById('admin-list-csapattag');
        const listTovabbi = document.getElementById('admin-list-tovabbi_tag');
        
        if (listCsapat) listCsapat.innerHTML = '';
        if (listTovabbi) listTovabbi.innerHTML = '';

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            window.teamMembersMap[docSnap.id] = data;
            const id = docSnap.id;
            const targetList = data.category === 'tovabbi_tag' ? listTovabbi : listCsapat;
            if (!targetList) return;

            const html = `
            <div style="display: flex; gap: 15px; align-items: center; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee;">
              <div style="width: 60px; height: 60px; flex-shrink: 0; border-radius: 50%; overflow: hidden; background: #f5f5f5;">
                <img src="${data.imageUrl || 'images/global/placeholder-user.jpg'}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--color-dark-blue);">${data.name} <span style="font-size: 0.9rem; color: #888;">(${data.nickname || ''})</span></div>
                <div style="font-size: 0.9rem; color: #666;">${data.role || ''} | Sorrend: ${data.order || 99}</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="edit-team-btn" data-id="${id}" style="background: #3498db; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: background 0.3s;">Szerkesztés</button>
                <button class="delete-team-btn" data-id="${id}" style="background: #e74c3c; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: background 0.3s;">Törlés</button>
              </div>
            </div>`;
            targetList.insertAdjacentHTML('beforeend', html);
        });

        // Add delete listeners
        
        // Add edit listeners
        document.querySelectorAll('.edit-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const data = window.teamMembersMap[id];
                
                document.getElementById('editTeamId').value = id;
                document.getElementById('editTeamOldImageUrl').value = data.imageUrl || '';
                document.getElementById('editTeamCategory').value = data.category || 'csapattag';
                
                document.getElementById('editTeamName').value = data.name || '';
                document.getElementById('editTeamNickname').value = data.nickname || '';
                document.getElementById('editTeamRole').value = data.role || '';
                document.getElementById('editTeamPhone').value = data.phone || '';
                document.getElementById('editTeamEmail').value = data.email || '';
                document.getElementById('editTeamOrder').value = data.order || 99;
                document.getElementById('editTeamDescription').value = data.description || '';
                
                const previewImg = document.getElementById('editTeamPreviewImg');
                if (data.imageUrl) {
                    previewImg.src = data.imageUrl;
                    previewImg.style.display = 'block';
                } else {
                    previewImg.style.display = 'none';
                }
                
                document.getElementById('editTeamModal').classList.add('show');
            });
        });

        document.querySelectorAll('.delete-team-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Biztosan törölni szeretnéd ezt a személyt?')) {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await deleteDoc(doc(db, 'team', id));
                        seedAndLoadTeamMembers();
                    } catch(err) {
                        console.error(err);
                        alert('Hiba a törlésnél.');
                    }
                }
            });
        });
    }

    // Call it
    seedAndLoadTeamMembers();


        // 5. Támogatóink
    const formSponsors = document.getElementById('form-sponsors');
    if (formSponsors) {
        // Kép előnézet a Támogató formhoz
        const sponsorImgInput = document.getElementById('sponsorLogo');
        const sponsorPreviewImg = document.getElementById('sponsorPreviewImg');
        const sponsorPreviewText = document.getElementById('sponsorPreviewText');
        
        if (sponsorImgInput) {
            sponsorImgInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (onloadEvent) => {
                        sponsorPreviewImg.src = onloadEvent.target.result;
                        sponsorPreviewImg.style.display = 'block';
                        if (sponsorPreviewText) sponsorPreviewText.style.display = 'none';
                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }

        formSponsors.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formSponsors.querySelector('button[type="submit"]');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Mentés folyamatban...';
            btn.disabled = true;

            try {
                let imageUrl = '';
                const fileInput = document.getElementById('sponsorLogo');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const storageRef = ref(storage, `sponsors/${Date.now()}_optimized.webp`);
                    const snapshot = await uploadBytes(storageRef, await compressImage(file));
                    imageUrl = await getDownloadURL(snapshot.ref);
                }

                await addDoc(collection(db, "sponsors"), {
                    name: document.getElementById('sponsorName').value,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                
                alert('Támogató sikeresen mentve!');
                formSponsors.reset();
                if (sponsorPreviewImg) {
                    sponsorPreviewImg.src = '';
                    sponsorPreviewImg.style.display = 'none';
                }
                if (sponsorPreviewText) sponsorPreviewText.style.display = 'block';
                if (window.seedAndLoadSponsors) window.seedAndLoadSponsors();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            }
        });
    }

    // --- Támogatók listája és seedelés ---
    window.sponsorsMap = {};
    
    window.seedAndLoadSponsors = async function() {
        const sponsorsRef = collection(db, 'sponsors');
        const q = query(sponsorsRef, orderBy('createdAt', 'desc'));
        let snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log("Seeding sponsors...");
            const dummyLogos = [
                { name: "Sponsor 1", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 2", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 3", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 4", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 5", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 6", url: "images/global/Logo_BEZS_emblema.png" },
                { name: "Sponsor 7", url: "images/global/Logo_BEZS_emblema.png" }
            ];
            for (const logo of dummyLogos) {
                await addDoc(sponsorsRef, {
                    name: logo.name,
                    imageUrl: logo.url,
                    createdAt: serverTimestamp()
                });
            }
            snapshot = await getDocs(q);
        }

        const listContainer = document.getElementById('admin-sponsors-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        window.sponsorsMap = {};

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            window.sponsorsMap[id] = data;

            const html = `
            <div style="width: 150px; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <div style="width: 130px; height: 100px; background: #f5f5f5; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="${data.imageUrl}" alt="${data.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
              </div>
              <div style="font-size: 0.9rem; font-weight: 500; text-align: center; color: var(--color-dark-blue); word-break: break-word; min-height: 40px; display: flex; align-items: center;">${data.name}</div>
              <div style="display: flex; gap: 5px; width: 100%;">
                <button class="edit-sponsor-btn" data-id="${id}" style="flex: 1; background: #3498db; color: #fff; border: none; padding: 4px; border-radius: 4px; cursor: pointer; transition: background 0.3s; font-size: 0.8rem;">Módosít</button>
                <button class="delete-sponsor-btn" data-id="${id}" style="flex: 1; background: #e74c3c; color: #fff; border: none; padding: 4px; border-radius: 4px; cursor: pointer; transition: background 0.3s; font-size: 0.8rem;">Töröl</button>
              </div>
            </div>`;
            listContainer.insertAdjacentHTML('beforeend', html);
        });

        // Add listeners
        document.querySelectorAll('.delete-sponsor-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Biztosan törölni szeretnéd ezt a támogatót?')) {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await deleteDoc(doc(db, 'sponsors', id));
                        window.seedAndLoadSponsors();
                    } catch(err) {
                        console.error(err);
                        alert('Hiba a törlésnél.');
                    }
                }
            });
        });

        document.querySelectorAll('.edit-sponsor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const data = window.sponsorsMap[id];
                
                document.getElementById('editSponsorId').value = id;
                document.getElementById('editSponsorOldImageUrl').value = data.imageUrl || '';
                document.getElementById('editSponsorName').value = data.name || '';
                
                const previewImg = document.getElementById('editSponsorPreviewImg');
                if (data.imageUrl) {
                    previewImg.src = data.imageUrl;
                    previewImg.style.display = 'block';
                } else {
                    previewImg.style.display = 'none';
                }
                
                document.getElementById('editSponsorModal').classList.add('show');
            });
        });
    }
    
    // Indítás
    if (document.getElementById('admin-sponsors-list')) {
        setTimeout(() => window.seedAndLoadSponsors(), 1000);
    }
    
    // Edit form listener
    const formEditSponsor = document.getElementById('form-edit-sponsor');
    if (formEditSponsor) {
        const editImgInput = document.getElementById('editSponsorImage');
        const editPreviewImg = document.getElementById('editSponsorPreviewImg');
        
        editImgInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (onloadEvent) => {
                    editPreviewImg.src = onloadEvent.target.result;
                    editPreviewImg.style.display = 'block';
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        const closeModalBtn = document.getElementById('closeEditSponsorModal');
        if(closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('editSponsorModal').classList.remove('show');
            });
        }

        formEditSponsor.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formEditSponsor.querySelector('button[type="submit"]');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Mentés...';
            btn.disabled = true;

            const id = document.getElementById('editSponsorId').value;
            const oldImageUrl = document.getElementById('editSponsorOldImageUrl').value;
            
            try {
                let finalImageUrl = oldImageUrl;
                if (editImgInput.files.length > 0) {
                    const file = editImgInput.files[0];
                    const storageRef = ref(storage, `sponsors/${Date.now()}_optimized.webp`);
                    const snapshot = await uploadBytes(storageRef, await compressImage(file));
                    finalImageUrl = await getDownloadURL(snapshot.ref);
                    
                    if (oldImageUrl && oldImageUrl.includes('firebasestorage')) {
                         try { await deleteObject(ref(storage, oldImageUrl)); } catch(e) {}
                    }
                }

                await updateDoc(doc(db, "sponsors", id), {
                    name: document.getElementById('editSponsorName').value,
                    imageUrl: finalImageUrl
                });

                alert('Támogató frissítve!');
                document.getElementById('editSponsorModal').classList.remove('show');
                formEditSponsor.reset();
                window.seedAndLoadSponsors();
                
            } catch (error) {
                console.error("Hiba a szerkesztés mentésekor:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            }
        });
    }

    // 6. Albumok (Galéria)
    const formAlbum = document.getElementById('form-album');
    if (formAlbum) {
        formAlbum.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formAlbum.querySelector('button[type="submit"]');
            btn.textContent = 'Album Létrehozása folyamatban...';
            btn.disabled = true;
            try {
                const dateInputValue = document.getElementById('albumDate').value;
                let finalDate = serverTimestamp();
                if (dateInputValue) {
                    finalDate = Timestamp.fromDate(new Date(dateInputValue));
                }
                
                const galleryImages = [];
                const galleryInput = document.getElementById('albumImages');
                if (galleryInput.files.length > 0) {
                    for (let i = 0; i < galleryInput.files.length; i++) {
                        const file = galleryInput.files[i];
                        const sRef = ref(storage, `albums/${Date.now()}_optimized_${i}.webp`);
                        const snap = await uploadBytes(sRef, await compressImage(file));
                        const url = await getDownloadURL(snap.ref);
                        galleryImages.push(url);
                    }
                }
                
                await addDoc(collection(db, "albums"), {
                    title: document.getElementById('albumName').value,
                    images: galleryImages,
                    createdAt: finalDate
                });
                
                alert('Album sikeresen létrehozva!');
                formAlbum.reset();
                loadAlbums(); // Frissíti a checkboxokat
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Album Létrehozása';
                btn.disabled = false;
            }
        });
    }

    // 7. Szociális Lakásügynökség
    const formHousing = document.getElementById('form-housing');
    if (formHousing) {
        formHousing.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formHousing.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                await addDoc(collection(db, "housing"), {
                    content: document.getElementById('housingContent').value,
                    createdAt: serverTimestamp()
                });
                alert('Lakásügynökség tartalom mentve!');
                formHousing.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Mentés';
                btn.disabled = false;
            }
        });
    }

    // 8. Projektjeink
    const formProjects = document.getElementById('form-projects');
    if (formProjects) {
        formProjects.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formProjects.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                const file = document.getElementById('projectImage').files[0];
                const storageRef = ref(storage, `projects/${Date.now()}_optimized.webp`);
                const snapshot = await uploadBytes(storageRef, await compressImage(file));
                const imageUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "projects"), {
                    title: document.getElementById('projectName').value,
                    description: document.getElementById('projectDesc').value,
                    link: document.getElementById('projectLink').value,
                    targetAmount: Number(document.getElementById('projectTargetAmount').value) || 0,
                    collectedAmount: 0,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                alert('Projekt sikeresen mentve!');
                formProjects.reset();
                if(window.loadProjectsList) window.loadProjectsList();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Projekt Mentése';
                btn.disabled = false;
            }
        });
    }

    // 9. Gyermekvédelem Szakmai Anyagok (PDF)
    const formChildDocs = document.getElementById('form-child-docs');
    if (formChildDocs) {
        formChildDocs.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formChildDocs.querySelector('button[type="submit"]');
            btn.textContent = 'Feltöltés...';
            btn.disabled = true;
            try {
                const file = document.getElementById('docFile').files[0];
                const storageRef = ref(storage, `child_docs/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "child_docs"), {
                    title: document.getElementById('docTitle').value,
                    fileUrl: fileUrl,
                    createdAt: serverTimestamp()
                });
                alert('Dokumentum sikeresen feltöltve!');
                formChildDocs.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Dokumentum Feltöltése';
                btn.disabled = false;
            }
        });
    }

    // 10. Podcast
    const formPodcasts = document.getElementById('form-podcasts');
    if (formPodcasts) {
        formPodcasts.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formPodcasts.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                await addDoc(collection(db, "podcasts"), {
                    title: document.getElementById('podcastTitle').value,
                    embed: document.getElementById('podcastEmbed').value,
                    createdAt: serverTimestamp()
                });
                alert('Podcast sikeresen mentve!');
                formPodcasts.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Podcast Mentése';
                btn.disabled = false;
            }
        });
    }
}

// --- Feltöltött Hírek Kezelése ---

async function loadAdminNews() {
    const listContainer = document.getElementById('admin-news-list');
    if (!listContainer) return;

    try {
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            listContainer.innerHTML = '<div style="text-align:center; color: var(--color-gray);">Nincsenek feltöltött hírek.</div>';
            return;
        }

        listContainer.innerHTML = '';
        listContainer.style.display = 'grid';
        listContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        listContainer.style.gap = '1.5rem';
        window.adminNewsData = {};

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            window.teamMembersMap[docSnap.id] = data;
            const id = docSnap.id;
            window.adminNewsData[id] = data;

            let dateStr = 'Ismeretlen dátum';
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
            }
            
            const statusLabel = data.published ? '<span style="background:var(--color-teal); color:white; padding: 3px 8px; border-radius: 4px; font-size:0.75rem; font-weight:bold;">Publikus</span>' : '<span style="background:var(--color-red); color:white; padding: 3px 8px; border-radius: 4px; font-size:0.75rem; font-weight:bold;">Rejtett</span>';
            const imageUrl = data.imageUrl || 'images/global/Logo_BEZS_emblema.png';

            const html = `
                <div class="admin-news-card" id="news-row-${id}" style="background: white; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-sm);">
                    <div style="height: 160px; background: url('${imageUrl}') center/cover; position: relative; border-bottom: 1px solid #eee;">
                        <div style="position: absolute; top: 10px; right: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${statusLabel}</div>
                    </div>
                    <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--color-dark-blue); line-height: 1.3;">${data.title}</h4>
                        <p style="margin: 0 0 1rem 0; color: var(--color-gray); font-size: 0.85rem;">${dateStr}</p>
                        <div style="margin-top: auto; display: flex; gap: 0.5rem;">
                            <button class="btn-edit" onclick="window.openEditNewsModal('${id}')" style="flex: 1; padding: 0.5rem; background: var(--color-teal); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.background='#0d7c71'" onmouseout="this.style.background='var(--color-teal)'">Szerkesztés</button>
                            <button class="btn-delete" onclick="window.deleteNews('${id}', '${data.imageUrl || ''}')" style="flex: 1; padding: 0.5rem; background: transparent; color: var(--color-red); border: 1px solid var(--color-red); border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='var(--color-red)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--color-red)';">Törlés</button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', html);
        });
    } catch (error) {
        console.error("Hiba a hírek betöltésekor:", error);
        listContainer.innerHTML = '<div style="text-align:center; color: red;">Hiba történt a betöltés során.</div>';
    }
}

window.deleteNews = async (id, imageUrl) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a hírt? Ezt nem lehet visszavonni.')) return;
    
    try {
        await deleteDoc(doc(db, "news", id));
        
        // Kép törlése a Storage-ból
        if (imageUrl && imageUrl.includes('firebasestorage')) {
            try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            } catch(e) {
                console.log("Kép törlése sikertelen vagy már nem létezik", e);
            }
        }
        
        const row = document.getElementById(`news-row-${id}`);
        if(row) row.remove();
        alert('Hír sikeresen törölve.');
    } catch (error) {
        console.error("Hiba törléskor:", error);
        alert('Hiba történt a törlés során.');
    }
};

window.openEditNewsModal = (id) => {
    const data = window.adminNewsData[id];
    if(!data) return;

    document.getElementById('editNewsId').value = id;
    document.getElementById('editNewsTitle').value = data.title;
    document.getElementById('editNewsExcerpt').value = data.excerpt;
    window.quillEditNews.root.innerHTML = data.content || '';
    document.getElementById('editNewsYoutubeLink').value = data.youtubeUrl || '';
    document.getElementById('editNewsPublished').checked = data.published;
    document.getElementById('editNewsOldImageUrl').value = data.imageUrl || '';
    
    if (data.createdAt) {
        const date = data.createdAt.toDate();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        document.getElementById('editNewsDate').value = `${yyyy}-${mm}-${dd}`;
    } else {
        document.getElementById('editNewsDate').value = '';
    }
    
    const preview = document.getElementById('editNewsPreview');
    if (data.imageUrl) {
        preview.src = data.imageUrl;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    
    // Checkboxok beállítása
    document.querySelectorAll('#editNewsAlbumCheckboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (data.albumIds && Array.isArray(data.albumIds)) {
        data.albumIds.forEach(albumId => {
            const cb = document.querySelector(`#editNewsAlbumCheckboxes input[value="${albumId}"]`);
            if (cb) cb.checked = true;
        });
    }

    document.getElementById('editNewsModal').classList.add('show');
};

document.getElementById('closeEditNewsModal')?.addEventListener('click', () => {
    document.getElementById('editNewsModal').classList.remove('show');
});

const formEditNews = document.getElementById('form-edit-news');
if (formEditNews) {
    formEditNews.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formEditNews.querySelector('button[type="submit"]');
        btn.textContent = 'Mentés folyamatban...';
        btn.disabled = true;

        const id = document.getElementById('editNewsId').value;
        const oldImageUrl = document.getElementById('editNewsOldImageUrl').value;
        
        try {
            let finalImageUrl = oldImageUrl;
            const fileInput = document.getElementById('editNewsImage');
            
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const storageRef = ref(storage, `news/${Date.now()}_optimized.webp`);
                const snapshot = await uploadBytes(storageRef, await compressImage(file));
                finalImageUrl = await getDownloadURL(snapshot.ref);
                
                if (oldImageUrl && oldImageUrl.includes('firebasestorage')) {
                     try { await deleteObject(ref(storage, oldImageUrl)); } catch(e) {}
                }
            }

            const dateInputValue = document.getElementById('editNewsDate').value;
            let finalDate = null;
            if (dateInputValue) {
                finalDate = Timestamp.fromDate(new Date(dateInputValue));
            }

            // Album ID-k összegyűjtése
            const selectedAlbums = [];
            document.querySelectorAll('#editNewsAlbumCheckboxes input[type="checkbox"]:checked').forEach(cb => {
                selectedAlbums.push(cb.value);
            });

            const updateData = {
                title: document.getElementById('editNewsTitle').value,
                excerpt: document.getElementById('editNewsExcerpt').value,
                content: window.quillEditNews.root.innerHTML,
                imageUrl: finalImageUrl,
                youtubeUrl: document.getElementById('editNewsYoutubeLink').value || '',
                albumIds: selectedAlbums,
                published: document.getElementById('editNewsPublished').checked
            };
            if (finalDate) {
                updateData.createdAt = finalDate;
            }

            await updateDoc(doc(db, "news", id), updateData);

            alert('Hír sikeresen frissítve!');
            document.getElementById('editNewsModal').classList.remove('show');
            formEditNews.reset();
            loadAdminNews(); // Lista frissítése
            
        } catch (error) {
            console.error("Hiba a szerkesztés mentésekor:", error);
            alert("Hiba történt a mentés során.");
        } finally {
            btn.textContent = 'Módosítások mentése';
            btn.disabled = false;
        }
    });
}


// --- Team Edit Modal Logic ---
const formEditTeam = document.getElementById('form-edit-team');
if (formEditTeam) {
    const editImgInput = document.getElementById('editTeamImage');
    const editPreviewImg = document.getElementById('editTeamPreviewImg');
    
    editImgInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (onloadEvent) => {
                editPreviewImg.src = onloadEvent.target.result;
                editPreviewImg.style.display = 'block';
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    document.getElementById('closeEditTeamModal').addEventListener('click', () => {
        document.getElementById('editTeamModal').classList.remove('show');
    });

    formEditTeam.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formEditTeam.querySelector('button[type="submit"]');
        const originalBtnText = btn.textContent;
        btn.textContent = 'Mentés folyamatban...';
        btn.disabled = true;

        const id = document.getElementById('editTeamId').value;
        const oldImageUrl = document.getElementById('editTeamOldImageUrl').value;
        
        try {
            let finalImageUrl = oldImageUrl;
            if (editImgInput.files.length > 0) {
                const file = editImgInput.files[0];
                const storageRef = ref(storage, `team/${Date.now()}_optimized.webp`);
                const snapshot = await uploadBytes(storageRef, await compressImage(file));
                finalImageUrl = await getDownloadURL(snapshot.ref);
                
                if (oldImageUrl && oldImageUrl.includes('firebasestorage')) {
                     try { await deleteObject(ref(storage, oldImageUrl)); } catch(e) {}
                }
            }

            const updateData = {
                name: document.getElementById('editTeamName').value,
                nickname: document.getElementById('editTeamNickname').value,
                role: document.getElementById('editTeamRole').value,
                phone: document.getElementById('editTeamPhone').value,
                email: document.getElementById('editTeamEmail').value,
                order: parseInt(document.getElementById('editTeamOrder').value) || 99,
                description: document.getElementById('editTeamDescription').value,
                imageUrl: finalImageUrl
            };

            await updateDoc(doc(db, "team", id), updateData);

            alert('Személy sikeresen frissítve!');
            document.getElementById('editTeamModal').classList.remove('show');
            formEditTeam.reset();
            seedAndLoadTeamMembers(); // Lista frissítése
            
        } catch (error) {
            console.error("Hiba a szerkesztés mentésekor:", error);
            alert("Hiba történt a mentés során.");
        } finally {
            btn.textContent = originalBtnText;
            btn.disabled = false;
        }
    });
}

// --- Képoptimalizáló (Kliens oldali méretezés és WebP konverzió) ---
async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                }, 'image/webp', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// --- Projektek listázása és kezelése ---
window.loadProjectsList = async function() {
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const listContainer = document.getElementById('admin-projects-list');
        const completedListContainer = document.getElementById('admin-completed-projects-list');
        if (!listContainer || !completedListContainer) return;
        
        let activeHtml = '';
        let completedHtml = '';
        window.adminProjectsList = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            window.adminProjectsList.push({ id: docSnap.id, ...data });
            
            const coverImage = data.imageUrl ? data.imageUrl : 'images/global/Logo_BEZS_emblema.png';
            const targetAmount = data.targetAmount || 0;
            const collectedAmount = data.collectedAmount || 0;
            const percentage = targetAmount > 0 ? Math.min(100, Math.floor((collectedAmount / targetAmount) * 100)) : 0;
            const isCompleted = targetAmount > 0 && collectedAmount >= targetAmount;
            
            const cardHtml = `
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; margin-bottom: 10px; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; gap: 15px; align-items: center; flex: 1;">
                    <img src="${coverImage}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                    <div style="flex: 1;">
                        <h4 style="margin:0 0 5px 0; color: var(--color-dark-blue);">${data.title}</h4>
                        <div style="font-size: 13px; margin-bottom: 8px; font-weight: 500;">Cél: ${targetAmount.toLocaleString('hu-HU')} Ft | Összegyűlt: ${collectedAmount.toLocaleString('hu-HU')} Ft (${percentage}%)</div>
                        <div style="width: 100%; max-width: 300px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; height: 8px; margin-bottom: 8px;">
                            <div style="width: ${percentage}%; background-color: var(--color-teal); height: 100%;"></div>
                        </div>
                        <div style="font-size: 12px;">
                            ${data.link ? '<a href="' + data.link + '" target="_blank" style="color: var(--color-teal); text-decoration: none;">Támogatási link megnyitása</a>' : '<span style="color:var(--color-gray);">Nincs link</span>'}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                    ${!isCompleted ? `<button class="admin-btn" style="background-color: var(--color-dark-blue); padding: 6px 12px; font-size: 0.85rem; color: white;" onclick="addProjectPayment('${docSnap.id}')">Befizetés rögzítése</button>` : ''}
                    <button class="admin-btn" style="background-color: var(--color-teal); padding: 6px 12px; font-size: 0.85rem; color: white;" onclick="editProject('${docSnap.id}')">Szerkesztés</button>
                    <button class="admin-btn" style="background-color: #dc3545; padding: 6px 12px; font-size: 0.85rem; color: white;" onclick="deleteProject('${docSnap.id}')">Törlés</button>
                </div>
            </div>
            `;
            
            if (isCompleted) {
                completedHtml += cardHtml;
            } else {
                activeHtml += cardHtml;
            }
        });
        
        listContainer.innerHTML = activeHtml === '' ? '<div style="color:var(--color-gray); font-size:14px;">Még nincsenek futó projektek.</div>' : activeHtml;
        completedListContainer.innerHTML = completedHtml === '' ? '<div style="color:var(--color-gray); font-size:14px;">Még nincsenek sikerrel zárult projektek.</div>' : completedHtml;
    } catch (e) {
        console.error("Hiba a projektek betöltésekor:", e);
    }
};

window.addProjectPayment = async function(id) {
    const project = window.adminProjectsList.find(p => p.id === id);
    if (!project) return;
    
    const amountStr = prompt(`Mennyi készpénzes felajánlást szeretnél rögzíteni a(z) "${project.title}" projekthez (Ft)?`);
    if (!amountStr) return;
    
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
        alert("Kérlek érvényes, nullánál nagyobb összeget adj meg!");
        return;
    }
    
    try {
        const newTotal = (project.collectedAmount || 0) + amount;
        await updateDoc(doc(db, "projects", id), {
            collectedAmount: newTotal
        });
        alert(`Sikeresen hozzáadva! Új egyenleg: ${newTotal.toLocaleString('hu-HU')} Ft`);
        window.loadProjectsList();
    } catch (e) {
        console.error(e);
        alert("Hiba történt a mentés során.");
    }
};

window.deleteProject = async function(id) {
    if(confirm("Biztosan törölni szeretnéd ezt a projektet?")) {
        try {
            await deleteDoc(doc(db, "projects", id));
            window.loadProjectsList();
            alert("Sikeresen törölve!");
        } catch (e) {
            console.error(e);
            alert("Hiba a törlés során!");
        }
    }
};

window.editProject = function(id) {
    const project = window.adminProjectsList.find(p => p.id === id);
    if(!project) return;
    
    const oldModal = document.getElementById('edit-project-modal');
    if(oldModal) oldModal.remove();
    
    const modalHtml = `
    <div id="edit-project-modal" style="position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center; overflow-y:auto; padding: 20px;">
        <div style="position:relative; background:white; padding:30px; border-radius:12px; width:100%; max-width:800px; max-height:90vh; overflow-y:auto; box-shadow: 0 5px 30px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('edit-project-modal').remove()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:28px; font-weight:bold; color:#aaa; cursor:pointer; transition:0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#aaa'">&times;</button>
            
            <h3 style="margin-bottom: 20px; color: var(--color-dark-blue);">Projekt szerkesztése</h3>
            <div class="admin-form-group">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Projekt Címe</label>
                <input type="text" id="editProjectTitle" class="admin-form-control" value="${project.title.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Rövid leírás</label>
                <textarea id="editProjectDesc" class="admin-form-control" style="width:100%; box-sizing:border-box; min-height:80px;">${project.description.replace(/"/g, '&quot;')}</textarea>
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Támogatási link (URL - Opcionális)</label>
                <input type="url" id="editProjectLink" class="admin-form-control" value="${project.link ? project.link.replace(/"/g, '&quot;') : ''}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Cél összeg (Ft)</label>
                <input type="number" id="editProjectTargetAmount" class="admin-form-control" value="${project.targetAmount || 0}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Eddig összegyűlt összeg (Ft)</label>
                <input type="number" id="editProjectCollectedAmount" class="admin-form-control" value="${project.collectedAmount || 0}" style="width:100%; box-sizing:border-box;">
            </div>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px;">Új borítókép feltöltése (opcionális)</label>
                <input type="file" id="editProjectImage" class="admin-form-control" accept="image/*" style="width:100%; box-sizing:border-box;">
            </div>
            <div style="display:flex; gap:10px; margin-top:30px;">
                <button id="btnSaveProjectChanges" class="admin-btn" style="background-color:var(--color-teal); color:white;" onclick="saveProjectChanges('${id}')">Módosítások mentése</button>
                <button class="admin-btn" style="background-color:#6c757d; color:white;" onclick="document.getElementById('edit-project-modal').remove()">Mégse</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveProjectChanges = async function(id) {
    const btn = document.getElementById('btnSaveProjectChanges');
    btn.textContent = "Mentés...";
    btn.disabled = true;
    
    try {
        const updateData = {
            title: document.getElementById('editProjectTitle').value,
            description: document.getElementById('editProjectDesc').value,
            link: document.getElementById('editProjectLink').value,
            targetAmount: Number(document.getElementById('editProjectTargetAmount').value) || 0,
            collectedAmount: Number(document.getElementById('editProjectCollectedAmount').value) || 0
        };
        
        const fileInput = document.getElementById('editProjectImage');
        if(fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const storageRef = ref(storage, `projects/${Date.now()}_optimized.webp`);
            const snapshot = await uploadBytes(storageRef, await compressImage(file));
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }
        
        await updateDoc(doc(db, "projects", id), updateData);
        alert("Sikeresen módosítva!");
        document.getElementById('edit-project-modal').remove();
        window.loadProjectsList();
    } catch(e) {
        console.error(e);
        alert("Hiba a mentés során!");
    } finally {
        btn.textContent = "Módosítások mentése";
        btn.disabled = false;
    }
};
