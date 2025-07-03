// script.js

// --- Import Firebase SDK (dari CDN, bukan npm) ---
// Pastikan Anda memuat ini di index.html jika tidak menggunakan modul bundler
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, onSnapshot, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ANDA ---
// GANTI placeholder ini dengan kredensial Firebase Anda yang sebenarnya!
const firebaseConfig = {
  apiKey: "AIzaSyCVoMytk0Xhqcmw8nQNXR6_lb0jLDXp-rY",
  authDomain: "mistry4ever-store-ce987.firebaseapp.com",
  projectId: "mistry4ever-store-ce987",
  storageBucket: "mistry4ever-store-ce987.firebasestorage.app",
  messagingSenderId: "52996287526",
  appId: "1:52996287526:web:1a122e9afce5f5abddcae7",
  measurementId: "G-N0VGECPQB8"
};

// Pastikan appId juga diambil dari config
const appId = firebaseConfig.appId || 'default-app-id';

let app;
let db;
let auth;
let currentUserId = null; // State untuk user ID Firebase

try {
    // Hanya inisialisasi Firebase jika semua konfigurasi tersedia
    if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("Firebase initialized successfully!");

        // Inisialisasi autentikasi dan dapatkan user ID
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                console.log("User authenticated:", currentUserId);
            } else {
                try {
                    await signInAnonymously(auth);
                    currentUserId = auth.currentUser.uid;
                    console.log("Signed in anonymously:", currentUserId);
                } catch (error) {
                    console.error("Firebase anonymous sign-in failed:", error);
                    currentUserId = null;
                }
            }
            // Render ulang aplikasi setelah auth siap
            renderApp();
        });

    } else {
        console.error("Firebase configuration is incomplete. Please check your firebaseConfig object in script.js.");
        // Jika Firebase tidak terinisialisasi, kita tetap bisa merender UI dasar
        renderApp();
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
    renderApp(); // Render aplikasi bahkan jika Firebase gagal
}

// --- Data Game ---
const gameData = {
    "Free Fire": [
        { id: "ff_5", label: "5 Diamonds", basePrice: 901 },
        { id: "ff_12", label: "12 Diamonds", basePrice: 1802 },
        { id: "ff_50", label: "50 Diamonds", basePrice: 7207 },
        { id: "ff_70", label: "70 Diamonds", basePrice: 9009 },
        { id: "ff_140", label: "140 Diamonds", basePrice: 18018 },
        { id: "ff_355", label: "355 Diamonds", basePrice: 45045 },
        { id: "ff_720", label: "720 Diamonds", basePrice: 90090 },
        { id: "ff_1450", label: "1450 Diamonds", basePrice: 180180 },
        { id: "ff_2180", label: "2180 Diamonds", basePrice: 270270 },
        { id: "ff_3640", label: "3640 Diamonds", basePrice: 450450 },
        { id: "ff_7290", label: "7290 Diamonds", basePrice: 900901 },
        { id: "ff_36500", label: "36500 Diamonds", basePrice: 4504504 },
        { id: "ff_73100", label: "73100 Diamonds", basePrice: 9009009 },
    ],
    "Mobile Legends": [
        { id: "ml_100_bonus", label: "100 Diamonds (50+50) pengisian pertama!", basePrice: 14200, type: "diamond", restrictedPaymentMethods: ["alfamart", "indomaret"] },
        { id: "ml_300_bonus", label: "300 Diamonds (150+150) pengisian pertama!", basePrice: 42350, type: "diamond", restrictedPaymentMethods: ["alfamart", "indomaret"] },
        { id: "ml_500_bonus", label: "500 Diamonds (250+250) pengisian pertama!", basePrice: 70600, type: "diamond", restrictedPaymentMethods: ["alfamart", "indomaret"] },
        { id: "ml_1000_bonus", label: "1000 Diamonds (500+500) pengisian pertama!", basePrice: 142000, type: "diamond", restrictedPaymentMethods: ["alfamart", "indomaret"] },

        { id: "ml_3_d", label: "3 Diamonds", basePrice: 1171, type: "diamond" },
        { id: "ml_5_d", label: "5 Diamonds", basePrice: 1423, type: "diamond" },
        { id: "ml_12_d", label: "12 Diamonds (11 + 1 Bonus)", basePrice: 3323, type: "diamond" },
        { id: "ml_19_d", label: "19 Diamonds (17 + 2 Bonus)", basePrice: 5223, type: "diamond" },
        { id: "ml_28_d", label: "28 Diamonds (25 + 3 Bonus)", basePrice: 7600, type: "diamond" },
        { id: "ml_44_d", label: "44 Diamonds (40 + 4 Bonus)", basePrice: 11400, type: "diamond" },
        { id: "ml_59_d", label: "59 Diamonds (53 + 6 Bonus)", basePrice: 15200, type: "diamond" },
        { id: "ml_85_d", label: "85 Diamonds (77 + 8 Bonus)", basePrice: 21850, type: "diamond" },
        { id: "ml_170_d", label: "170 Diamonds (154 + 16 Bonus)", basePrice: 43700, type: "diamond" },
        { id: "ml_240_d", label: "240 Diamonds (217 + 23 Bonus)", basePrice: 61750, type: "diamond" },
        { id: "ml_296_d", label: "296 Diamonds (256 + 40 Bonus)", basePrice: 76000, type: "diamond" },
        { id: "ml_408_d", label: "408 Diamonds (367 + 41 Bonus)", basePrice: 104500, type: "diamond" },
        { id: "ml_568_d", label: "568 Diamonds (503 + 65 Bonus)", basePrice: 142500, type: "diamond" },
        { id: "ml_875_d", label: "875 Diamonds (774 + 101 Bonus)", basePrice: 218500, type: "diamond" },
        { id: "ml_2010_d", label: "2010 Diamonds (1708 + 302 Bonus)", basePrice: 475000, type: "diamond" },
        { id: "ml_4830_d", label: "4830 Diamonds (4003 + 827 Bonus)", basePrice: 1140000, type: "diamond" },

        { id: "ml_twilight_pass", label: "Twilight Pass", basePrice: 150000, type: "pass" },
        { id: "ml_weekly_diamond_pass", label: "Weekly Diamond Pass", basePrice: 27550, type: "pass" },
    ],
};

// Data metode pembayaran
const paymentMethods = [
    { id: "gopay", name: "GoPay", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
    { id: "dana", name: "DANA", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H3a2 2 0 0 0 0 4h14a2 2 0 0 0 2-2v-3"></path><path d="M2 7h2m0 4h2m0 4h2"></path></svg>`, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
    { id: "ovo", name: "OVO", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg>`, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
    { id: "qris", name: "QRIS", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-qr-code"><rect width="8" height="8" x="2" y="2" rx="1"></rect><rect width="8" height="8" x="14" y="2" rx="1"></rect><rect width="8" height="8" x="2" y="14" rx="1"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M7 17h.01"></path><path d="M12 17h.01"></path><path d="M17 12h.01"></path><path d="M17 14h.01"></path><path d="M14 12h.01"></path><path d="M12 14h.01"></path></svg>`, simulatedFee: 0, isEwallet: true, paymentNumber: "QR Code akan ditampilkan" },
    { id: "alfamart", name: "Alfamart", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="M22 7H2v3h20V7Z"></path><path d="M6 15H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"></path><path d="M12 7V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path></svg>`, simulatedFee: 0, isUnderMaintenance: true, isEwallet: false },
    { id: "indomaret", name: "Indomaret", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="M22 7H2v3h20V7Z"></path><path d="M6 15H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"></path><path d="M12 7V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path></svg>`, simulatedFee: 0, isUnderMaintenance: true, isEwallet: false },
];

const CS_PHONE_NUMBER = "6288218776877"; // Nomor WA CS

// --- Global State Variables (menggantikan React useState) ---
let selectedGame = null;
let userId = '';
let zoneId = '';
let userEmail = '';
let selectedItem = null;
let selectedPaymentMethod = null;
let transactionStatus = null; // 'error' atau null
let message = ''; // Pesan error

const ADMIN_FEE = 2000;
const TAX_RATE = 0.11;

// --- Helper Functions ---
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Math.round(amount));
}

function isPaymentMethodRestricted(methodId) {
    if (selectedItem && selectedItem.restrictedPaymentMethods) {
        return selectedItem.restrictedPaymentMethods.includes(methodId);
    }
    return false;
}

function getEffectivePaymentFee() {
    if (!selectedItem || !selectedPaymentMethod) return 0;
    let effectiveFee = selectedPaymentMethod.simulatedFee;

    if (selectedGame === "Mobile Legends" && selectedItem.id === "ml_4830_d") {
        if (selectedPaymentMethod.id === "alfamart") {
            effectiveFee = 60000;
        } else if (selectedPaymentMethod.id === "indomaret") {
            effectiveFee = 120000;
        }
    } else {
        if (selectedPaymentMethod.id === "alfamart" || selectedPaymentMethod.id === "indomaret") {
            effectiveFee = 2500;
        } else if (selectedPaymentMethod.id === "qris") {
            effectiveFee = 500;
        }
    }
    return effectiveFee;
}

function calculateFinalPrice() {
    if (!selectedItem || !selectedPaymentMethod) return 0;
    const effectivePaymentFee = getEffectivePaymentFee();
    const subtotalBeforeTax = selectedItem.basePrice + effectivePaymentFee + ADMIN_FEE;
    return subtotalBeforeTax * (1 + TAX_RATE);
}

// --- DOM Manipulation / Render Functions ---
const appRoot = document.getElementById('app');

function clearAppRoot() {
    if (appRoot) {
        appRoot.innerHTML = '';
    }
}

function renderApp() {
    clearAppRoot();

    const mainContainer = document.createElement('div');
    mainContainer.className = "min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white font-inter p-4 flex items-center justify-center";
    
    const contentBox = document.createElement('div');
    contentBox.className = "bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-purple-700 relative";

    // Tombol CS WhatsApp
    const whatsappLink = document.createElement('a');
    whatsappLink.href = `https://wa.me/${CS_PHONE_NUMBER}?text=${encodeURIComponent("Halo saya mempunyai keluhan")}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.className = "absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition-colors z-10";
    whatsappLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`;
    contentBox.appendChild(whatsappLink);

    // Header Toko
    const header = document.createElement('h1');
    header.className = "text-4xl font-extrabold text-center mb-6 text-purple-400 drop-shadow-lg";
    header.textContent = "Mistry4Ever Store";
    contentBox.appendChild(header);

    if (!selectedGame) {
        renderGameSelection(contentBox);
    } else {
        renderTopUpForm(contentBox);
    }

    // Modal Status Transaksi (Hanya untuk Error)
    if (transactionStatus === 'error') {
        renderErrorModal(mainContainer);
    }

    mainContainer.appendChild(contentBox);
    appRoot.appendChild(mainContainer);
}

function renderGameSelection(parentEl) {
    const gameSelectionDiv = document.createElement('div');
    gameSelectionDiv.className = "text-center";

    const promptText = document.createElement('p');
    promptText.className = "text-lg mb-6 text-gray-300";
    promptText.textContent = "Pilih game untuk top-up:";
    gameSelectionDiv.appendChild(promptText);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = "flex flex-col sm:flex-row gap-4 justify-center";

    // Free Fire Button
    const ffButton = document.createElement('button');
    ffButton.onclick = () => { selectedGame = "Free Fire"; resetFormState(); renderApp(); };
    ffButton.className = "flex flex-col items-center justify-center p-6 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50";
    ffButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad mb-2"><path d="M6 12H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path><path d="M6 12v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"></path><path d="M12 18v4"></path><path d="M17 21h-2"></path><path d="M7 21h2"></path><path d="M12 12h.01"></path><path d="M12 12v.01"></path></svg><span class="text-xl font-semibold">Free Fire</span>`;
    buttonContainer.appendChild(ffButton);

    // Mobile Legends Button
    const mlButton = document.createElement('button');
    mlButton.onclick = () => { selectedGame = "Mobile Legends"; resetFormState(); renderApp(); };
    mlButton.className = "flex flex-col items-center justify-center p-6 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50";
    mlButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad mb-2"><path d="M6 12H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path><path d="M6 12v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"></path><path d="M12 18v4"></path><path d="M17 21h-2"></path><path d="M7 21h2"></path><path d="M12 12h.01"></path><path d="M12 12v.01"></path></svg><span class="text-xl font-semibold">Mobile Legends</span>`;
    buttonContainer.appendChild(mlButton);

    gameSelectionDiv.appendChild(buttonContainer);
    parentEl.appendChild(gameSelectionDiv);
}

function renderTopUpForm(parentEl) {
    const formDiv = document.createElement('div');

    const headerContainer = document.createElement('div');
    headerContainer.className = "flex items-center justify-between mb-6";
    const title = document.createElement('h2');
    title.className = "text-3xl font-bold text-purple-300";
    title.textContent = `Top Up ${selectedGame}`;
    headerContainer.appendChild(title);

    const changeGameButton = document.createElement('button');
    changeGameButton.onclick = () => { selectedGame = null; resetFormState(); renderApp(); };
    changeGameButton.className = "px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors";
    changeGameButton.textContent = "Ganti Game";
    headerContainer.appendChild(changeGameButton);
    formDiv.appendChild(headerContainer);

    // Bagian Input Game yang Dipilih
    const gameDisplayDiv = document.createElement('div');
    gameDisplayDiv.className = "mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700";
    gameDisplayDiv.innerHTML = `<p class="block text-lg font-medium text-gray-300 mb-2">🎮Game : <span class="font-semibold text-purple-300">${selectedGame}</span></p>`;
    formDiv.appendChild(gameDisplayDiv);

    // Bagian Input Email
    const emailDiv = document.createElement('div');
    emailDiv.className = "mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700";
    emailDiv.innerHTML = `
        <label for="userEmail" class="block text-lg font-medium text-gray-300 mb-2">Email (untuk notifikasi):</label>
        <input type="email" id="userEmail" value="${userEmail}" placeholder="Masukkan Email Anda" class="w-full p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mb-4" required>
    `;
    const emailInput = emailDiv.querySelector('#userEmail');
    emailInput.oninput = (e) => { userEmail = e.target.value; renderApp(); }; // Re-render untuk update ringkasan
    formDiv.appendChild(emailDiv);

    // Bagian Input Player ID
    const userIdDiv = document.createElement('div');
    userIdDiv.className = "mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700";
    userIdDiv.innerHTML = `
        <label for="userId" class="block text-lg font-medium text-gray-300 mb-2">User ID:</label>
        <input type="text" id="userId" value="${userId}" placeholder="${selectedGame === "Free Fire" ? "Masukkan Player ID Anda" : "Masukkan User ID Anda"}" class="w-full p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mb-4">
    `;
    const userIdInput = userIdDiv.querySelector('#userId');
    userIdInput.oninput = (e) => {
        if (selectedGame === "Free Fire") {
            userId = e.target.value;
        } else {
            userId = e.target.value.replace(/\D/g, ''); // Hanya angka untuk ML
            if (userId.length === 10) {
                // Fokus ke Zone ID jika ML dan User ID 10 digit (simulasi useRef)
                const zoneIdEl = document.getElementById('zoneId');
                if (zoneIdEl) zoneIdEl.focus();
            }
        }
        renderApp(); // Re-render untuk update ringkasan
    };
    formDiv.appendChild(userIdDiv);

    // Bagian Input Zone ID (Hanya untuk Mobile Legends)
    if (selectedGame === "Mobile Legends") {
        const zoneIdDiv = document.createElement('div');
        zoneIdDiv.className = "mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700";
        zoneIdDiv.innerHTML = `
            <label for="zoneId" class="block text-lg font-medium text-gray-300 mb-2">Zone ID (Server ID):</label>
            <div class="flex items-center gap-2">
                <input type="text" id="zoneId" value="${zoneId}" placeholder="Masukkan Zone ID Anda (misal: 1234)" class="flex-grow p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
                <button title="Klik untuk melihat cara menemukan ID Anda" class="p-3 bg-gray-700 hover:bg-gray-600 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle text-gray-300"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                </button>
            </div>
        `;
        const zoneIdInput = zoneIdDiv.querySelector('#zoneId');
        zoneIdInput.oninput = (e) => { zoneId = e.target.value.replace(/\D/g, ''); renderApp(); }; // Re-render untuk update ringkasan
        formDiv.appendChild(zoneIdDiv);
    }

    // Validasi input
    if (userId.length === 0 || userEmail.length === 0 || (selectedGame === "Mobile Legends" && zoneId.length === 0)) {
        const validationMsg = document.createElement('p');
        validationMsg.className = "text-gray-400 text-sm mt-2";
        validationMsg.textContent = `Pastikan User ID, Email, dan ${selectedGame === "Mobile Legends" ? "Zone ID" : ""} Anda benar.`;
        formDiv.appendChild(validationMsg);
    }

    // Bagian Pilihan Paket Diamond
    const diamondSection = document.createElement('div');
    diamondSection.className = "mb-8";
    diamondSection.innerHTML = `<p class="block text-lg font-medium text-gray-300 mb-4">Pilih Paket Diamond:</p>`;
    const diamondGrid = document.createElement('div');
    diamondGrid.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";

    gameData[selectedGame].forEach(item => {
        const itemButton = document.createElement('button');
        itemButton.onclick = () => { selectedItem = item; renderApp(); };
        let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-diamond text-blue-400 mr-3"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.4L7 18.7c.92.92 2.22 1.4 3.54 1.38h.04c1.32.02 2.62-.46 3.54-1.38l4.3-4.3a2.41 2.41 0 0 0 0-3.4L17 5.3c-.92-.92-2.22-1.4-3.54-1.38h-.04c-1.32-.02-2.62.46-3.54 1.38z"></path><path d="M7 18.7 17 5.3"></path><path d="M17 18.7 7 5.3"></path></svg>`;
        if (item.type === "pass") {
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar text-yellow-400 mr-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`;
        }
        itemButton.className = `flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ease-in-out ${selectedItem?.id === item.id ? 'border-purple-500 bg-purple-900 shadow-lg' : 'border-gray-700 bg-gray-800 hover:border-purple-600 hover:bg-gray-700'}`;
        itemButton.innerHTML = `
            <div class="flex items-center">
                ${iconSvg}
                <span class="text-lg font-medium text-left">${item.label}</span>
            </div>
            <span class="text-xl font-bold text-green-400">${formatRupiah(item.basePrice)}</span>
        `;
        diamondGrid.appendChild(itemButton);
    });
    diamondSection.appendChild(diamondGrid);
    formDiv.appendChild(diamondSection);

    // Bagian Pilihan Metode Pembayaran
    const paymentSection = document.createElement('div');
    paymentSection.className = "mb-8";
    paymentSection.innerHTML = `<p class="block text-lg font-medium text-gray-300 mb-4">Pilih Metode Pembayaran:</p>`;
    const paymentGrid = document.createElement('div');
    paymentGrid.className = "grid grid-cols-2 sm:grid-cols-3 gap-3";

    paymentMethods.forEach(method => {
        const methodButton = document.createElement('button');
        const isDisabled = method.isUnderMaintenance || (selectedItem && selectedItem.restrictedPaymentMethods && selectedItem.restrictedPaymentMethods.includes(method.id));
        methodButton.onclick = () => { if (!isDisabled) { selectedPaymentMethod = method; renderApp(); } };
        methodButton.disabled = isDisabled;
        methodButton.className = `flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ease-in-out ${selectedPaymentMethod?.id === method.id ? 'border-purple-500 bg-purple-900 shadow-lg' : 'border-gray-700 bg-gray-800 hover:border-purple-600 hover:bg-gray-700'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        methodButton.innerHTML = `
            ${method.icon}
            <span class="text-sm mt-1 text-center">${method.name}</span>
            ${method.isUnderMaintenance ? `<span class="text-xs text-red-400 mt-1">Diperbaiki</span>` : ''}
        `;
        paymentGrid.appendChild(methodButton);
    });
    paymentSection.appendChild(paymentGrid);
    formDiv.appendChild(paymentSection);

    // Bagian Ringkasan Pesanan
    const isSummaryVisible = selectedItem && selectedPaymentMethod && userId && userEmail && (selectedGame === "Free Fire" || (selectedGame === "Mobile Legends" && zoneId));
    if (isSummaryVisible) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = "bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700";
        summaryDiv.innerHTML = `
            <h3 class="text-xl font-bold text-purple-300 mb-3">Ringkasan Pesanan:</h3>
            <div class="text-gray-300 text-base space-y-2">
                <p><strong>Game:</strong> ${selectedGame}</p>
                <p>
                    <strong>ID Pemain:</strong> ${userId}
                    ${selectedGame === "Mobile Legends" ? `<br /><span class="text-sm text-gray-400">(${zoneId})</span>` : ''}
                </p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Paket:</strong> ${selectedItem.label}</p>
                <p><strong>Metode Pembayaran:</strong> ${selectedPaymentMethod.name}</p>
                <p class="text-base text-gray-300">Harga Paket: ${formatRupiah(selectedItem.basePrice)}</p>
                ${getEffectivePaymentFee() > 0 ? `<p class="text-base text-gray-300">Biaya Metode Pembayaran: ${formatRupiah(getEffectivePaymentFee())}</p>` : ''}
                <p class="text-base text-gray-300">Biaya Admin: ${formatRupiah(ADMIN_FEE)}</p>
                <p class="text-base text-gray-300">
                    Pajak (11%): ${formatRupiah((selectedItem.basePrice + getEffectivePaymentFee() + ADMIN_FEE) * TAX_RATE)}
                </p>
                <p class="text-2xl font-bold text-green-400 mt-4">
                    Total Harga: ${formatRupiah(calculateFinalPrice())}
                </p>
            </div>
        `;
        formDiv.appendChild(summaryDiv);
    }

    // Tombol Top-Up
    const topUpButton = document.createElement('button');
    topUpButton.onclick = handleTopUp;
    const isTopUpDisabled = !userId || !userEmail || !selectedItem || !selectedPaymentMethod || selectedPaymentMethod.isUnderMaintenance || (selectedItem && selectedItem.restrictedPaymentMethods && selectedItem.restrictedPaymentMethods.includes(selectedPaymentMethod.id)) || (selectedGame === "Mobile Legends" && !zoneId);
    topUpButton.disabled = isTopUpDisabled;
    topUpButton.className = `w-full py-4 text-white text-xl font-bold rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${isTopUpDisabled ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50'}`;
    topUpButton.textContent = "Top Up Sekarang!";
    formDiv.appendChild(topUpButton);

    parentEl.appendChild(formDiv);
}

function renderErrorModal(parentEl) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50";

    const modalContent = document.createElement('div');
    modalContent.className = "bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full border-t-4 border-red-500";

    modalContent.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle text-red-500 mx-auto mb-4 animate-shake"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
        <p class="text-xl font-semibold mb-4">${message}</p>
        <button id="closeModalBtn" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors">Tutup</button>
    `;
    
    modalContent.querySelector('#closeModalBtn').onclick = closeModal;
    modalOverlay.appendChild(modalContent);
    parentEl.appendChild(modalOverlay);
}

// --- Event Handlers ---
async function handleTopUp() {
    // Validasi input
    if (!userId || !userEmail || !selectedItem || !selectedPaymentMethod) {
        transactionStatus = 'error';
        message = 'Mohon lengkapi User ID, Email, pilih paket, dan metode pembayaran.';
        renderApp();
        return;
    }

    if (selectedGame === "Mobile Legends" && !zoneId) {
        transactionStatus = 'error';
        message = 'Mohon lengkapi Zone ID untuk Mobile Legends.';
        renderApp();
        return;
    }

    if (isPaymentMethodRestricted(selectedPaymentMethod.id) || selectedPaymentMethod.isUnderMaintenance) {
        transactionStatus = 'error';
        message = `Paket ${selectedItem.label} tidak dapat dibeli menggunakan ${selectedPaymentMethod.name} karena sedang dalam perbaikan atau tidak tersedia.`;
        renderApp();
        return;
    }

    const finalPrice = calculateFinalPrice();

    // Save transaction to Firestore
    if (db && currentUserId) {
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/transactions`), {
                userId,
                zoneId: selectedGame === "Mobile Legends" ? zoneId : "N/A",
                userEmail,
                selectedGame,
                selectedItemLabel: selectedItem.label,
                paymentMethodName: selectedPaymentMethod.name,
                finalPrice: finalPrice,
                status: 'pending',
                timestamp: serverTimestamp(),
                userFirebaseId: currentUserId,
                adminAcknowledged: false
            });

            // Construct WhatsApp message
            const whatsappMessage = `
🎮Game : ${selectedGame}
✉️Email : ${userEmail}
📄ID : ${userId}
${selectedGame === "Mobile Legends" ? `📋Server ID : ${zoneId}` : ''}
💎Topup : ${selectedItem.label}
💲Harga : ${formatRupiah(finalPrice)}
📪Metode : ${selectedPaymentMethod.name}
            `.trim();

            const whatsappUrl = `https://wa.me/${CS_PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

            // Redirect to WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form after a short delay, assuming WhatsApp opens successfully
            setTimeout(() => {
                resetFormState();
                renderApp(); // Render ulang untuk membersihkan form
            }, 1000);

        } catch (error) {
            console.error("Error adding transaction or redirecting:", error);
            transactionStatus = 'error';
            message = 'Gagal memproses transaksi. Silakan coba lagi.';
            renderApp();
        }
    } else {
        transactionStatus = 'error';
        message = 'Aplikasi tidak terhubung ke database. Silakan coba lagi nanti.';
        renderApp();
    }
}

function resetFormState() {
    userId = '';
    zoneId = '';
    userEmail = '';
    selectedItem = null;
    selectedPaymentMethod = null;
    transactionStatus = null;
    message = '';
}

function closeModal() {
    transactionStatus = null;
    message = '';
    renderApp();
}

// --- Initial Render ---
// Render aplikasi saat DOM sudah siap
document.addEventListener('DOMContentLoaded', renderApp);
