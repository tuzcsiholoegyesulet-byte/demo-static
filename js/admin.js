import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                // Jogosult: betöltő képernyő eltüntetése
                document.getElementById('loadingScreen').style.display = 'none';
                
                // Név beállítása
                const nameSpan = document.getElementById('adminName');
                if (userDoc.data().firstname) {
                    nameSpan.textContent = userDoc.data().firstname + ' (Admin)';
                } else if (user.displayName) {
                    nameSpan.textContent = user.displayName + ' (Admin)';
                } else {
                    nameSpan.textContent = user.email + ' (Admin)';
                }
            } else {
                // Be van jelentkezve, de nem admin
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
