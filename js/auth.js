import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Képtömörítő és átméretező funkció a böngészőben (kliens oldalon)
window.compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        // Ha nem kép (pl. PDF), akkor eredetiben hagyjuk
        if (!file.type.startsWith('image/') || file.type === 'image/gif') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Átméretezés, ha túl széles
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Konvertálás gyors és takarékos WebP formátumba
                canvas.toBlob(blob => {
                    if (blob) {
                        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const newFile = new File([blob], newFileName, {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(newFile);
                    } else {
                        resolve(file); // Fallback hiba esetén
                    }
                }, 'image/webp', quality);
            };
            img.onerror = error => resolve(file); // Hibás kép esetén feltöltjük eredetiben
        };
        reader.onerror = error => reject(error);
    });
};

// Globális fájlfeltöltő függvény a CMS-hez (Optimalizálással)
window.uploadFileToStorage = async (file, pathPrefix = 'uploads/') => {
    if (!file) return null;
    
    // Optimalizáljuk a fájlt (ha kép, akkor kicsinyíti és WebP-be rakja)
    const processedFile = await window.compressImage(file);
    
    const fileName = Date.now() + '_' + processedFile.name;
    const storageRef = ref(storage, pathPrefix + fileName);
    await uploadBytes(storageRef, processedFile);
    return await getDownloadURL(storageRef);
};

// 1. Dinamikus Auth Modal (Felugró ablak) HTML injektálása
const authModalHTML = `
<dialog id="authModal" class="auth-dialog">
  <div class="auth-modal-content">
    <button class="auth-modal-close" id="closeAuthModal" aria-label="Bezárás">
      <svg viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
    </button>
    
    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin">Bejelentkezés</button>
      <button class="auth-tab" id="tabRegister">Regisztráció</button>
    </div>
    
    <div class="auth-forms-container">
      
      <!-- BEJELENTKEZÉS NÉZET -->
      <div id="viewLogin" class="auth-form-view active">
        <p class="subtitle">Lépj be a fiókodba a folytatáshoz!</p>
        <button class="btn-google-compact" id="btnGoogleLogin">
          <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Bejelentkezés Google-fiókkal
        </button>
        
        <div class="auth-divider"><span>VAGY</span></div>
        
        <form class="auth-form" id="loginForm">
          <div class="form-group">
            <label for="loginEmail">E-mail cím</label>
            <input type="email" id="loginEmail" placeholder="pelda@email.hu" required>
          </div>
          <div class="form-group">
            <label for="loginPassword">Jelszó</label>
            <input type="password" id="loginPassword" placeholder="••••••••" required>
          </div>
          <div class="auth-options" style="justify-content: flex-start; margin-bottom: 25px;">
            <label class="auth-checkbox-label" style="display:flex !important; flex-direction:row !important; align-items:center !important; gap:8px !important; cursor:pointer; margin:0 !important; width:max-content;">
              <input type="checkbox" style="width:auto !important; padding:0 !important; margin:0 !important; display:inline-block !important; flex-shrink:0;"> 
              <span style="font-weight:normal; color:var(--color-gray); white-space:nowrap; margin:0; padding:0; display:inline-block;">Emlékezz rám</span>
            </label>
          </div>
          <button type="submit" class="btn-auth">Bejelentkezés</button>
          <div style="text-align: center; margin-top: 15px;">
            <a href="#" id="linkForgot" style="color:var(--color-teal);font-size:0.85rem;font-weight:600;text-decoration:underline;">Elfelejtett jelszó?</a>
          </div>
        </form>
      </div>
      
      <!-- REGISZTRÁCIÓ NÉZET -->
      <div id="viewRegister" class="auth-form-view">
        <p class="subtitle">Hozd létre a profilodat!</p>
        <button class="btn-google-compact" id="btnGoogleReg">
          <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Regisztráció Google-fiókkal
        </button>
        
        <div class="auth-divider"><span>VAGY E-MAILLEL</span></div>
        
        <form class="auth-form" id="registerForm">
          <div style="display:flex; gap:10px;">
            <div class="form-group" style="flex:1;">
              <label for="regLastname">Vezetéknév</label>
              <input type="text" id="regLastname" placeholder="Kovács" required>
            </div>
            <div class="form-group" style="flex:1;">
              <label for="regFirstname">Keresztnév</label>
              <input type="text" id="regFirstname" placeholder="Béla" required>
            </div>
          </div>
          <div class="form-group">
            <label for="regEmail">E-mail cím</label>
            <input type="email" id="regEmail" placeholder="pelda@email.hu" required>
          </div>
          <div class="form-group">
            <label for="regPassword">Jelszó</label>
            <input type="password" id="regPassword" placeholder="Min. 8 karakter" required minlength="8">
          </div>
          <label class="terms-label">
            <input type="checkbox" required>
            <span>Elfogadom az <a href="adatkezelesi-tajekoztato.html" target="_blank">Adatkezelési tájékoztatót</a>.</span>
          </label>
          <button type="submit" class="btn-auth">Fiók létrehozása</button>
        </form>
      </div>

      <!-- ELFELEJTETT JELSZÓ NÉZET -->
      <div id="viewForgot" class="auth-form-view">
        <p class="subtitle">Add meg az e-mail címed, és küldünk egy linket a jelszavad visszaállításához.</p>
        
        <form class="auth-form" id="forgotForm">
          <div class="form-group">
            <label for="forgotEmail">E-mail cím</label>
            <input type="email" id="forgotEmail" placeholder="pelda@email.hu" required>
          </div>
          <button type="submit" class="btn-auth" style="margin-bottom:15px;">Jelszó-visszaállító link küldése</button>
          <div style="text-align:center;">
            <a href="#" id="linkBackToLogin" style="color:var(--color-gray);font-size:0.85rem;text-decoration:underline;">Vissza a bejelentkezéshez</a>
          </div>
        </form>
      </div>

    </div>
  </div>
</dialog>
`;
document.body.insertAdjacentHTML('beforeend', authModalHTML);

// 2. Tab logika és Modal nyitás/zárás
const authModal = document.getElementById('authModal');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const viewLogin = document.getElementById('viewLogin');
const viewRegister = document.getElementById('viewRegister');
const viewForgot = document.getElementById('viewForgot');
const linkForgot = document.getElementById('linkForgot');
const linkBackToLogin = document.getElementById('linkBackToLogin');

function hideAllViews() {
    viewLogin.classList.remove('active');
    viewRegister.classList.remove('active');
    viewForgot.classList.remove('active');
}

tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    hideAllViews();
    viewLogin.classList.add('active');
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    hideAllViews();
    viewRegister.classList.add('active');
});

linkForgot.addEventListener('click', (e) => {
    e.preventDefault();
    hideAllViews();
    viewForgot.classList.add('active');
});

linkBackToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    tabLogin.click();
});

document.getElementById('closeAuthModal').addEventListener('click', () => {
    if (typeof authModal.close === 'function') {
        authModal.close();
    } else {
        authModal.removeAttribute('open');
    }
});

window.openAuthModal = (view = 'login') => {
    if (typeof authModal.showModal === 'function') {
        authModal.showModal();
    } else {
        authModal.setAttribute('open', '');
    }
    if(view === 'register') {
        tabRegister.click();
    } else {
        tabLogin.click();
    }
};

// 3. Firebase Auth Funkciók
window.handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        authModal.close();
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        let errorMsg = 'Helytelen e-mail cím vagy jelszó.';
        if(error.code === 'auth/user-not-found') errorMsg = 'Nincs ilyen regisztrált felhasználó.';
        if(error.code === 'auth/wrong-password') errorMsg = 'Hibás jelszó.';
        alert(errorMsg + ' (Részletek: ' + error.code + ')');
    }
};

window.handleRegister = async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const firstname = document.getElementById('regFirstname').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            firstname: firstname,
            role: 'user',
            createdAt: new Date().toISOString()
        });
        
        alert('Sikeres regisztráció! Üdvözlünk, ' + firstname + '!');
        authModal.close();
        window.location.reload();
    } catch (error) {
        console.error(error);
        let errorMsg = 'Hiba történt a regisztráció során.';
        if(error.code === 'auth/email-already-in-use') errorMsg = 'Ezzel az e-mail címmel már regisztráltak.';
        if(error.code === 'auth/weak-password') errorMsg = 'A jelszó túl gyenge (minimum 6 karakter).';
        alert(errorMsg + ' (Részletek: ' + error.code + ')');
    }
};

window.handleGoogleAuth = async (e) => {
    if(e) e.preventDefault();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let isAdmin = false;
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    firstname: user.displayName || '',
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            } else {
                isAdmin = userDoc.data().role === 'admin';
            }
        } catch (dbError) {
            console.warn("Firestore nem érhető el vagy jogosultság hiányzik:", dbError);
        }
        
        authModal.close();
        if (isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error("Google Auth error:", error);
        // Csak akkor dobunk hibaüzenetet, ha nem a felhasználó zárta be az ablakot
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
            alert('Hiba a Google bejelentkezés során: ' + error.message);
        }
    }
};

window.handleLogout = async (e) => {
    if(e) e.preventDefault();
    try {
        await signOut(auth);
        const path = window.location.pathname;
        if (path.includes('profil.html') || path.includes('admin.html')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    } catch(error) {
        console.error(error);
    }
};

window.handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Az e-mailt elküldtük! Kérlek, nézd meg a postafiókodat (a Spam mappát is) a jelszó-visszaállítási linkért.');
        tabLogin.click(); // Visszavált a bejelentkezés nézetre
    } catch (error) {
        console.error(error);
        let errorMsg = 'Hiba történt a levél küldése közben.';
        if(error.code === 'auth/user-not-found') errorMsg = 'Ezzel az e-mail címmel nincs felhasználó regisztrálva.';
        alert(errorMsg + ' (Részletek: ' + error.code + ')');
    }
};

document.getElementById('loginForm').addEventListener('submit', window.handleLogin);
document.getElementById('registerForm').addEventListener('submit', window.handleRegister);
document.getElementById('forgotForm').addEventListener('submit', window.handleForgotPassword);
document.getElementById('btnGoogleLogin').addEventListener('click', window.handleGoogleAuth);
document.getElementById('btnGoogleReg').addEventListener('click', window.handleGoogleAuth);

// 4. Menüsáv frissítése bejelentkezett állapot alapján
onAuthStateChanged(auth, (user) => {
    const loginBtns = document.querySelectorAll('.login-nav-btn');
    loginBtns.forEach(btn => {
        if (user) {
            // Bejelentkezve
            btn.classList.add('logged-in');
            btn.innerHTML = `<svg viewBox="0 0 512 512"><path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/></svg>`;
            btn.setAttribute('aria-label', 'Profilom');
            btn.href = 'profil.html';
            btn.onclick = null; // Töröljük a modal nyitást, ha eddig az volt
            
            // Készítsük el a lenyíló menüt, ha még nincs
            if (!btn.parentNode.querySelector('.profile-dropdown-menu')) {
                // Hozzáadjuk a szülőhöz a szükséges stílus osztályt a hover kezeléshez
                btn.parentNode.classList.add('has-profile-dropdown');
                
                const dropdown = document.createElement('ul');
                dropdown.className = 'dropdown-menu profile-dropdown-menu';
                
                // Alapértelmezett HTML
                dropdown.innerHTML = `
                    <li><a href="profil.html#profil">Profil</a></li>
                    <li><a href="profil.html#onkentes">Önkéntes munka</a></li>
                    <li><a href="profil.html#tamogatas">Támogatás</a></li>
                    <li id="admin-menu-item" style="display:none;"><a href="admin.html" style="color: var(--color-teal); font-weight: bold;">Admin Panel</a></li>
                    <li><hr style="margin: 0.5rem 0; border-color: rgba(0,0,0,0.1);"></li>
                    <li><a href="#" class="logout-action" style="color: var(--color-red);">Kijelentkezés</a></li>
                `;
                
                // Profil adatok frissítő függvénye
                const updateProfilePage = (name) => {
                    const welcomeText = document.getElementById('profileWelcomeText');
                    if (welcomeText) welcomeText.textContent = `Üdvözlünk, ${name}!`;
                    const displayName = document.getElementById('profileDisplayName');
                    if (displayName) displayName.textContent = name;
                    const emailEl = document.getElementById('profileEmail');
                    if (emailEl) emailEl.textContent = user.email;
                };

                // Kijelentkezés esemény hozzárendelése
                const logoutLink = dropdown.querySelector('.logout-action');
                logoutLink.onclick = window.handleLogout;
                
                // Jogosultság ellenőrzése és Admin gomb megjelenítése
                getDoc(doc(db, "users", user.uid)).then(userDoc => {
                    let displayString = user.displayName || user.email.split('@')[0];
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (data.role === 'admin') {
                            const adminItem = dropdown.querySelector('#admin-menu-item');
                            if (adminItem) adminItem.style.display = 'block';
                        }
                        if (data.firstname) displayString = data.firstname;
                    }
                    updateProfilePage(displayString);
                }).catch(err => {
                    console.error("Error fetching user role:", err);
                    updateProfilePage(user.displayName || user.email.split('@')[0]);
                });
                
                // Beillesztés a gomb mellé
                btn.parentNode.insertBefore(dropdown, btn.nextSibling);
            }
            
            // Ha a régi különálló kijelentkezés gomb megvan, töröljük
            const oldLogoutBtn = btn.parentNode.querySelector('.logout-nav-btn');
            if (oldLogoutBtn) oldLogoutBtn.remove();
        } else {
            // Nincs bejelentkezve -> Modal megnyitása kattintásra
            btn.classList.remove('logged-in');
            btn.innerHTML = `<svg viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>`;
            btn.setAttribute('aria-label', 'Bejelentkezés');
            btn.href = '#';
            btn.onclick = (e) => {
                e.preventDefault();
                window.openAuthModal();
            };
            
            // Tisztítás, ha korábban be volt jelentkezve
            btn.parentNode.classList.remove('has-profile-dropdown');
            const dropdown = btn.parentNode.querySelector('.profile-dropdown-menu');
            if (dropdown) dropdown.remove();
            
            // Ha van régi kijelentkezés gomb, töröljük
            if (btn.nextElementSibling && btn.nextElementSibling.classList.contains('logout-nav-btn')) {
                btn.nextElementSibling.remove();
            }
        }
    });

    // Bistro specific logic
    const bistroPrompt = document.getElementById('bistro-auth-prompt');
    const bistroEmail = document.getElementById('own-email');
    const bistroName = document.getElementById('own-name');
    if (user) {
        if (bistroPrompt) bistroPrompt.style.display = 'none';
        if (bistroEmail && !bistroEmail.value) {
            bistroEmail.value = user.email;
            if (typeof updateTray === 'function') updateTray();
        }
        if (bistroName && user.displayName && !bistroName.value) {
            bistroName.value = user.displayName;
        }
    } else {
        if (bistroPrompt) bistroPrompt.style.display = 'block';
    }
});
