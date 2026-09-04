import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
        await signInWithEmailAndPassword(auth, email, password);
        authModal.close();
        window.location.reload();
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
        await createUserWithEmailAndPassword(auth, email, password);
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
    try {
        await signInWithPopup(auth, provider);
        authModal.close();
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert('Hiba a Google bejelentkezés során.');
    }
};

window.handleLogout = async (e) => {
    if(e) e.preventDefault();
    try {
        await signOut(auth);
        window.location.reload();
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
            btn.innerHTML = `<svg viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>`;
            btn.setAttribute('aria-label', 'Profilom');
            btn.href = 'profil.html';
            btn.onclick = null; // Töröljük a modal nyitást, ha eddig az volt
            
            // Kijelentkezés gomb hozzáadása, ha még nincs
            if (!btn.nextElementSibling || !btn.nextElementSibling.classList.contains('logout-nav-btn')) {
                const logoutBtn = document.createElement('a');
                logoutBtn.href = '#';
                logoutBtn.className = 'search-nav-btn logout-nav-btn';
                logoutBtn.setAttribute('aria-label', 'Kijelentkezés');
                logoutBtn.title = 'Kijelentkezés';
                logoutBtn.innerHTML = `<svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg>`;
                logoutBtn.onclick = window.handleLogout;
                btn.parentNode.insertBefore(logoutBtn, btn.nextSibling);
            }
        } else {
            // Nincs bejelentkezve -> Modal megnyitása kattintásra
            btn.innerHTML = `<svg viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>`;
            btn.setAttribute('aria-label', 'Bejelentkezés');
            btn.href = '#';
            btn.onclick = (e) => {
                e.preventDefault();
                window.openAuthModal();
            };
            
            // Ha van kijelentkezés gomb, töröljük
            if (btn.nextElementSibling && btn.nextElementSibling.classList.contains('logout-nav-btn')) {
                btn.nextElementSibling.remove();
            }
        }
    });
});
