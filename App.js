import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { Gamepad, Diamond, CheckCircle, XCircle, Wallet, Store, Smartphone, CreditCard, Calendar, HelpCircle, QrCode, MessageCircle, User, Send, Trash2, Loader, Copy } from 'lucide-react';

// --- Firebase Initialization (MUST BE AT THE TOP LEVEL) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// --- Context for Firebase and Auth ---
const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firestoreDb, setFirestoreDb] = useState(null);
  const [firebaseAuth, setFirebaseAuth] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!app || !db || !auth) {
      console.warn("Firebase app, db, or auth not initialized. Skipping auth listener.");
      return;
    }

    setFirestoreDb(db);
    setFirebaseAuth(auth);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setCurrentUserId(user.uid);
      } else {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
            setCurrentUser(auth.currentUser);
            setCurrentUserId(auth.currentUser.uid);
          } else {
            await signInAnonymously(auth);
            setCurrentUser(auth.currentUser);
            setCurrentUserId(auth.currentUser.uid);
          }
        } catch (error) {
          console.error("Firebase anonymous sign-in failed:", error);
          setCurrentUser(null);
          setCurrentUserId(null);
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ firestoreDb, firebaseAuth, currentUser, isAuthReady, currentUserId, appId }}>
      {children}
    </FirebaseContext.Provider>
  );
};


// --- Game Data ---
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
  { id: "gopay", name: "GoPay", icon: <Smartphone size={24} />, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
  { id: "dana", name: "DANA", icon: <Wallet size={24} />, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
  { id: "ovo", name: "OVO", icon: <CreditCard size={24} />, simulatedFee: 0, isEwallet: true, paymentNumber: "088218776877" },
  { id: "qris", name: "QRIS", icon: <QrCode size={24} />, simulatedFee: 0, isEwallet: true, paymentNumber: "QR Code akan ditampilkan" },
  { id: "alfamart", name: "Alfamart", icon: <Store size={24} />, simulatedFee: 0, isUnderMaintenance: true, isEwallet: false },
  { id: "indomaret", name: "Indomaret", icon: <Store size={24} />, simulatedFee: 0, isUnderMaintenance: true, isEwallet: false },
];

const CS_PHONE_NUMBER = "6288218776877"; // Nomor WA CS

// --- Main App Component (User Mode) ---
function UserApp() {
  const { firestoreDb, isAuthReady, currentUserId, appId } = useContext(FirebaseContext);
  const [selectedGame, setSelectedGame] = useState(null);
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState(''); // Zone ID is now optional based on game
  const [userEmail, setUserEmail] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null); // Used only for error messages now
  const [message, setMessage] = useState(''); // Used only for error messages now

  const zoneIdInputRef = useRef(null);

  const ADMIN_FEE = 2000;
  const TAX_RATE = 0.11;

  // Memuat skrip Tailwind CSS dari CDN secara dinamis
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://cdn.tailwindcss.com"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const handleUserIdChange = (e) => {
    // For Free Fire, allow any input. For ML, restrict to numbers.
    if (selectedGame === "Free Fire") {
      setUserId(e.target.value);
    } else {
      const value = e.target.value.replace(/\D/g, ''); // Only numbers for ML
      setUserId(value);
      if (value.length === 10 && zoneIdInputRef.current && selectedGame === "Mobile Legends") {
        zoneIdInputRef.current.focus();
      }
    }
  };

  const handleZoneIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setZoneId(value);
  };

  const handleUserEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const isPaymentMethodRestricted = (methodId) => {
    if (selectedItem && selectedItem.restrictedPaymentMethods) {
      return selectedItem.restrictedPaymentMethods.includes(methodId);
    }
    return false;
  };

  const getEffectivePaymentFee = () => {
    if (!selectedItem || !selectedPaymentMethod) return 0;
    let effectiveFee = selectedPaymentMethod.simulatedFee;

    // Specific fee adjustments for ML 4830 Diamonds
    if (selectedGame === "Mobile Legends" && selectedItem.id === "ml_4830_d") {
      if (selectedPaymentMethod.id === "alfamart") {
        effectiveFee = 60000;
      } else if (selectedPaymentMethod.id === "indomaret") {
        effectiveFee = 120000;
      }
    } else {
      // General fees for other methods/items
      if (selectedPaymentMethod.id === "alfamart" || selectedPaymentMethod.id === "indomaret") {
          effectiveFee = 2500;
      } else if (selectedPaymentMethod.id === "qris") {
          effectiveFee = 500;
      }
    }
    return effectiveFee;
  };

  const calculateFinalPrice = () => {
    if (!selectedItem || !selectedPaymentMethod) return 0;
    const effectivePaymentFee = getEffectivePaymentFee();
    const subtotalBeforeTax = selectedItem.basePrice + effectivePaymentFee + ADMIN_FEE;
    return subtotalBeforeTax * (1 + TAX_RATE);
  };

  const handleTopUp = async () => {
    // Validation for User ID and Email
    if (!userId || !userEmail || !selectedItem || !selectedPaymentMethod) {
      setTransactionStatus('error');
      setMessage('Mohon lengkapi User ID, Email, pilih paket, dan metode pembayaran.');
      return;
    }

    // Validation for Zone ID if Mobile Legends is selected
    if (selectedGame === "Mobile Legends" && !zoneId) {
        setTransactionStatus('error');
        setMessage('Mohon lengkapi Zone ID untuk Mobile Legends.');
        return;
    }

    if (isPaymentMethodRestricted(selectedPaymentMethod.id) || selectedPaymentMethod.isUnderMaintenance) {
        setTransactionStatus('error');
        setMessage(`Paket ${selectedItem.label} tidak dapat dibeli menggunakan ${selectedPaymentMethod.name} karena sedang dalam perbaikan atau tidak tersedia.`);
        return;
    }

    const finalPrice = calculateFinalPrice();

    // Save transaction to Firestore
    if (firestoreDb && currentUserId) {
        try {
            await addDoc(collection(firestoreDb, `artifacts/${appId}/public/data/transactions`), {
                userId,
                zoneId: selectedGame === "Mobile Legends" ? zoneId : "N/A", // Save Zone ID only for ML
                userEmail,
                selectedGame,
                selectedItemLabel: selectedItem.label,
                paymentMethodName: selectedPaymentMethod.name,
                finalPrice: finalPrice,
                status: 'pending', // Still pending until confirmed by admin/payment
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
            `.trim(); // .trim() to remove leading/trailing whitespace from the template literal

            const whatsappUrl = `https://wa.me/${CS_PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

            // Redirect to WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form after a short delay, assuming WhatsApp opens successfully
            setTimeout(() => {
                resetForm();
            }, 1000);

        } catch (error) {
            console.error("Error adding transaction or redirecting:", error);
            setTransactionStatus('error');
            setMessage('Gagal memproses transaksi. Silakan coba lagi.');
        }
    } else {
        setTransactionStatus('error');
        setMessage('Aplikasi tidak terhubung ke database. Silakan coba lagi nanti.');
    }
  };

  const resetForm = () => {
    setSelectedGame(null);
    setUserId('');
    setZoneId('');
    setUserEmail('');
    setSelectedItem(null);
    setSelectedPaymentMethod(null);
    setTransactionStatus(null); // Reset status
    setMessage(''); // Reset message
  };

  useEffect(() => {
    if (selectedItem && selectedPaymentMethod && (isPaymentMethodRestricted(selectedPaymentMethod.id) || selectedPaymentMethod.isUnderMaintenance)) {
      setSelectedPaymentMethod(null);
    }
  }, [selectedItem, selectedPaymentMethod]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white font-inter p-4 flex items-center justify-center">
      <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-purple-700 relative">
        {/* Tombol CS WhatsApp di kanan atas */}
        <a href={`https://wa.me/${CS_PHONE_NUMBER}?text=${encodeURIComponent("Halo saya mempunyai keluhan")}`} target="_blank" rel="noopener noreferrer"
           className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition-colors z-10">
            <MessageCircle size={20} />
        </a>

        {/* Header Toko */}
        <h1 className="text-4xl font-extrabold text-center mb-6 text-purple-400 drop-shadow-lg">
          Mistry4Ever Store
        </h1>

        {/* Bagian Pemilihan Game */}
        {!selectedGame && (
          <div className="text-center">
            <p className="text-lg mb-6 text-gray-300">Pilih game untuk top-up:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSelectedGame("Free Fire")}
                className="flex flex-col items-center justify-center p-6 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                <Gamepad size={48} className="mb-2" />
                <span className="text-xl font-semibold">Free Fire</span>
              </button>
              <button
                onClick={() => setSelectedGame("Mobile Legends")}
                className="flex flex-col items-center justify-center p-6 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <Gamepad size={48} className="mb-2" />
                <span className="text-xl font-semibold">Mobile Legends</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Top-Up setelah game dipilih */}
        {selectedGame && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-purple-300">
                Top Up {selectedGame}
              </h2>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                Ganti Game
              </button>
            </div>

            {/* Bagian Input Game yang Dipilih */}
            <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="block text-lg font-medium text-gray-300 mb-2">
                    🎮Game : <span className="font-semibold text-purple-300">{selectedGame}</span>
                </p>
            </div>

            {/* Bagian Input Email */}
            <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label htmlFor="userEmail" className="block text-lg font-medium text-gray-300 mb-2">
                Email (untuk notifikasi):
              </label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={handleUserEmailChange}
                placeholder="Masukkan Email Anda"
                className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mb-4"
                required
              />

              {/* Bagian Input Player ID */}
              <label htmlFor="userId" className="block text-lg font-medium text-gray-300 mb-2">
                User ID:
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={handleUserIdChange}
                placeholder={selectedGame === "Free Fire" ? "Masukkan Player ID Anda" : "Masukkan User ID Anda"}
                className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mb-4"
              />

              {/* Bagian Input Zone ID (Hanya untuk Mobile Legends) */}
              {selectedGame === "Mobile Legends" && (
                <>
                  <label htmlFor="zoneId" className="block text-lg font-medium text-gray-300 mb-2">
                    Zone ID (Server ID):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      id="zoneId"
                      ref={zoneIdInputRef}
                      value={zoneId}
                      onChange={handleZoneIdChange}
                      placeholder="Masukkan Zone ID Anda (misal: 1234)"
                      className="flex-grow p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                    <button title="Klik untuk melihat cara menemukan ID Anda" className="p-3 bg-gray-700 hover:bg-gray-600 rounded-md">
                        <HelpCircle size={20} className="text-gray-300"/>
                    </button>
                  </div>
                </>
              )}
              {(userId.length === 0 || userEmail.length === 0 || (selectedGame === "Mobile Legends" && zoneId.length === 0)) && (
                <p className="text-gray-400 text-sm mt-2">Pastikan User ID, Email, dan {selectedGame === "Mobile Legends" ? "Zone ID" : ""} Anda benar.</p>
              )}
            </div>

            {/* Bagian Pilihan Paket Diamond */}
            <div className="mb-8">
              <p className="block text-lg font-medium text-gray-300 mb-4">
                Pilih Paket Diamond:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gameData[selectedGame].map((item) => {
                  let icon = <Diamond size={24} className="text-blue-400 mr-3" />;
                  if (item.type === "pass") {
                    icon = <Calendar size={24} className="text-yellow-400 mr-3" />;
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ease-in-out
                        ${selectedItem?.id === item.id
                          ? 'border-purple-500 bg-purple-900 shadow-lg'
                          : 'border-gray-700 bg-gray-800 hover:border-purple-600 hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        {icon}
                        <span className="text-lg font-medium text-left">{item.label}</span>
                      </div>
                      <span className="text-xl font-bold text-green-400">
                        {formatRupiah(item.basePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bagian Pilihan Metode Pembayaran */}
            <div className="mb-8">
              <p className="block text-lg font-medium text-gray-300 mb-4">
                Pilih Metode Pembayaran:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const isDisabled = method.isUnderMaintenance || (selectedItem && selectedItem.restrictedPaymentMethods && selectedItem.restrictedPaymentMethods.includes(method.id));
                  return (
                    <button
                      key={method.id}
                      onClick={() => !isDisabled && setSelectedPaymentMethod(method)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                        ${selectedPaymentMethod?.id === method.id
                          ? 'border-purple-500 bg-purple-900 shadow-lg'
                          : 'border-gray-700 bg-gray-800 hover:border-purple-600 hover:bg-gray-700'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {method.icon}
                      <span className="text-sm mt-1 text-center">{method.name}</span>
                      {method.isUnderMaintenance && (
                        <span className="text-xs text-red-400 mt-1">Diperbaiki</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bagian Ringkasan Pesanan */}
            {(selectedItem && selectedPaymentMethod && userId && userEmail && (selectedGame === "Free Fire" || (selectedGame === "Mobile Legends" && zoneId))) && (
              <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
                <h3 className="text-xl font-bold text-purple-300 mb-3">Ringkasan Pesanan:</h3>
                <div className="text-gray-300 text-base space-y-2">
                  <p><strong>Game:</strong> {selectedGame}</p>
                  <p>
                    <strong>ID Pemain:</strong> {userId}
                    {selectedGame === "Mobile Legends" && (
                        <><br /><span className="text-sm text-gray-400">({zoneId})</span></>
                    )}
                  </p>
                  <p><strong>Email:</strong> {userEmail}</p>
                  <p><strong>Paket:</strong> {selectedItem.label}</p>
                  <p><strong>Metode Pembayaran:</strong> {selectedPaymentMethod.name}</p>
                  <p className="text-base text-gray-300">Harga Paket: {formatRupiah(selectedItem.basePrice)}</p>
                  {getEffectivePaymentFee() > 0 && (
                    <p className="text-base text-gray-300">Biaya Metode Pembayaran: {formatRupiah(getEffectivePaymentFee())}</p>
                  )}
                  <p className="text-base text-gray-300">Biaya Admin: {formatRupiah(ADMIN_FEE)}</p>
                  <p className="text-base text-gray-300">
                    Pajak (11%): {formatRupiah((selectedItem.basePrice + getEffectivePaymentFee() + ADMIN_FEE) * TAX_RATE)}
                  </p>
                  <p className="text-2xl font-bold text-green-400 mt-4">
                    Total Harga: {formatRupiah(calculateFinalPrice())}
                  </p>
                </div>
              </div>
            )}

            {/* Tombol Top-Up */}
            <button
              onClick={handleTopUp}
              disabled={!userId || !userEmail || !selectedItem || !selectedPaymentMethod || selectedPaymentMethod.isUnderMaintenance || (selectedItem && selectedItem.restrictedPaymentMethods && selectedItem.restrictedPaymentMethods.includes(selectedPaymentMethod.id)) || (selectedGame === "Mobile Legends" && !zoneId)}
              className={`w-full py-4 text-white text-xl font-bold rounded-lg shadow-xl transform transition-all duration-300 ease-in-out
                ${(!userId || !userEmail || !selectedItem || !selectedPaymentMethod || selectedPaymentMethod.isUnderMaintenance || (selectedItem && selectedItem.restrictedPaymentMethods && selectedItem.restrictedPaymentMethods.includes(selectedPaymentMethod.id)) || (selectedGame === "Mobile Legends" && !zoneId))
                  ? 'bg-gray-600 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50'
                }
              `}
            >
              Top Up Sekarang!
            </button>
          </div>
        )}

        {/* Modal Status Transaksi (Hanya untuk Error) */}
        {transactionStatus === 'error' && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full border-t-4 border-red-500">
              <XCircle size={64} className="text-red-500 mx-auto mb-4 animate-shake" />
              <p className="text-xl font-semibold mb-4">{message}</p>
              <button
                onClick={() => {
                  setTransactionStatus(null);
                  setMessage('');
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// --- Main Application Wrapper (Removed Admin Login Logic) ---
export default function WrappedApp() {
  return (
    <FirebaseProvider>
      <UserApp /> {/* Directly render UserApp */}
    </FirebaseProvider>
  );
}
