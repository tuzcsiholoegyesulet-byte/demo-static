import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

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

// Űrlapok beküldésének kezelése
function initForms() {
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
                    const storageRef = ref(storage, `news/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    imageUrl = await getDownloadURL(snapshot.ref);
                }
                
                await addDoc(collection(db, "news"), {
                    title: document.getElementById('newsTitle').value,
                    excerpt: document.getElementById('newsExcerpt').value,
                    content: document.getElementById('newsContent').value,
                    imageUrl: imageUrl,
                    published: document.getElementById('newsPublished').checked,
                    createdAt: serverTimestamp(),
                    authorRole: currentUserRole
                });
                
                alert('Hír sikeresen feltöltve!');
                formNews.reset();
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
    const formTransparency = document.getElementById('form-transparency');
    if (formTransparency) {
        formTransparency.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formTransparency.querySelector('button[type="submit"]');
            btn.textContent = 'Feltöltés folyamatban...';
            btn.disabled = true;
            
            try {
                const fileInput = document.getElementById('transparencyFile');
                const file = fileInput.files[0];
                const storageRef = ref(storage, `transparency/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "transparency"), {
                    year: document.getElementById('transparencyYear').value,
                    name: document.getElementById('transparencyName').value,
                    fileUrl: fileUrl,
                    createdAt: serverTimestamp()
                });
                
                alert('Beszámoló sikeresen feltöltve!');
                formTransparency.reset();
            } catch (error) {
                console.error("Hiba a beszámoló mentésekor:", error);
                alert("Hiba történt a feltöltés során.");
            } finally {
                btn.textContent = 'Beszámoló Mentése';
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
                await addDoc(collection(db, "media"), {
                    title: document.getElementById('mediaTitle').value,
                    source: document.getElementById('mediaSource').value,
                    link: document.getElementById('mediaLink').value,
                    date: document.getElementById('mediaDate').value,
                    createdAt: serverTimestamp()
                });
                
                alert('Média megjelenés sikeresen mentve!');
                formMedia.reset();
            } catch (error) {
                console.error("Hiba a média mentésekor:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Média Mentése';
                btn.disabled = false;
            }
        });
    }
    // 4. Csapatunk (Munkatárs)
    const formTeam = document.getElementById('form-team');
    if (formTeam) {
        formTeam.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formTeam.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                const file = document.getElementById('teamImage').files[0];
                const storageRef = ref(storage, `team/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "team"), {
                    name: document.getElementById('teamName').value,
                    role: document.getElementById('teamRole').value,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                alert('Munkatárs sikeresen mentve!');
                formTeam.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Munkatárs Mentése';
                btn.disabled = false;
            }
        });
    }

    // 5. Támogatóink
    const formSponsors = document.getElementById('form-sponsors');
    if (formSponsors) {
        formSponsors.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formSponsors.querySelector('button[type="submit"]');
            btn.textContent = 'Mentés...';
            btn.disabled = true;
            try {
                const file = document.getElementById('sponsorLogo').files[0];
                const storageRef = ref(storage, `sponsors/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const logoUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "sponsors"), {
                    name: document.getElementById('sponsorName').value,
                    logoUrl: logoUrl,
                    createdAt: serverTimestamp()
                });
                alert('Támogató sikeresen mentve!');
                formSponsors.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Támogató Mentése';
                btn.disabled = false;
            }
        });
    }

    // 6. Galéria
    const formGallery = document.getElementById('form-gallery');
    if (formGallery) {
        formGallery.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formGallery.querySelector('button[type="submit"]');
            btn.textContent = 'Feltöltés...';
            btn.disabled = true;
            try {
                const file = document.getElementById('galleryImage').files[0];
                const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "gallery"), {
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                alert('Kép sikeresen feltöltve a galériába!');
                formGallery.reset();
            } catch (error) {
                console.error("Hiba:", error);
                alert("Hiba történt a mentés során.");
            } finally {
                btn.textContent = 'Kép Feltöltése';
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
                const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                
                await addDoc(collection(db, "projects"), {
                    title: document.getElementById('projectName').value,
                    description: document.getElementById('projectDesc').value,
                    link: document.getElementById('projectLink').value,
                    imageUrl: imageUrl,
                    createdAt: serverTimestamp()
                });
                alert('Projekt sikeresen mentve!');
                formProjects.reset();
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

