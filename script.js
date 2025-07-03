// script.js

// Custom alert function
function showCustomAlert(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').classList.add('show');
}

function closeCustomAlert() {
    document.getElementById('customAlert').classList.remove('show');
}

function showInfo(message) {
    showCustomAlert("Info", message);
}

let selectedGame = '';
let selectedDiamondPrice = 0;
let selectedDiamondCount = '';
let selectedDiamondType = '';
let selectedPaymentMethod = '';
let selectedUserID = '';
let selectedZoneID = '';
let selectedEmail = '';

const gameSelectionScreen = document.getElementById('gameSelectionScreen');
const mlbbContent = document.getElementById('mlbbContent');
const ffContent = document.getElementById('ffContent');

// Get elements for event listeners
const backToGameSelectionBtn = document.getElementById('backToGameSelectionBtn');
const closeCustomAlertBtn = document.getElementById('closeCustomAlertBtn');
const okCustomAlertBtn = document.getElementById('okCustomAlertBtn');
const infoIcons = document.querySelectorAll('.info-icon'); // Select all info icons

// Initial state: show game selection screen
gameSelectionScreen.classList.add('active');
mlbbContent.classList.remove('active');
ffContent.classList.remove('active');

// Function to go back to game selection
function goBackToGameSelection() {
    gameSelectionScreen.classList.add('active');
    mlbbContent.classList.remove('active');
    ffContent.classList.remove('active');
    // Reset selections
    selectedGame = '';
    selectedDiamondPrice = 0;
    selectedDiamondCount = '';
    selectedDiamondType = '';
    selectedPaymentMethod = '';
    selectedUserID = '';
    selectedZoneID = '';
    selectedEmail = '';
    // Clear inputs
    document.getElementById('mlbbUserID').value = '';
    document.getElementById('mlbbZoneID').value = '';
    document.getElementById('mlbbEmail').value = '';
    document.getElementById('ffPlayerID').value = '';
    document.getElementById('ffEmail').value = '';

    // Deselect all diamond items
    document.querySelectorAll('.diamond-item').forEach(item => item.classList.remove('selected'));
    // Deselect all payment items
    document.querySelectorAll('.payment-item').forEach(item => item.classList.remove('selected'));
}

// Add event listener for back button
backToGameSelectionBtn.addEventListener('click', goBackToGameSelection);

// Add event listeners for custom alert buttons
closeCustomAlertBtn.addEventListener('click', closeCustomAlert);
okCustomAlertBtn.addEventListener('click', closeCustomAlert);

// Add event listeners for info icons
infoIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        const infoMessage = this.getAttribute('data-info');
        showInfo(infoMessage);
    });
});


// Game selection logic
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function() {
        selectedGame = this.getAttribute('data-game');
        gameSelectionScreen.classList.remove('active');
        if (selectedGame === 'mlbb') {
            mlbbContent.classList.add('active');
            ffContent.classList.remove('active');
            // Reset tab to Diamond for MLBB
            document.querySelectorAll('#mlbbContent .tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelector('#mlbbContent .tab-button[data-tab="diamond"]').classList.add('active');
            document.querySelectorAll('#mlbbContent .tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById('diamond-content').classList.remove('hidden');
        } else if (selectedGame === 'ff') {
            ffContent.classList.add('active');
            mlbbContent.classList.remove('active');
        }
    });
});

// --- Tab Switching Logic (MLBB specific) ---
document.querySelectorAll('#mlbbContent .tab-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('#mlbbContent .tab-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('#mlbbContent .tab-content').forEach(content => content.classList.add('hidden'));
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId + '-content').classList.remove('hidden');
        // Reset diamond selection when tab changes
        document.querySelectorAll('.diamond-item').forEach(item => item.classList.remove('selected'));
        selectedDiamondPrice = 0;
        selectedDiamondCount = '';
        selectedDiamondType = '';
    });
});

// --- Diamond Item Selection Logic ---
document.querySelectorAll('.diamond-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove 'selected' class from all diamond items in the current active content section
        document.querySelectorAll(`#${selectedGame}Content .diamond-item`).forEach(di => di.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        this.classList.add('selected');

        // Update selected diamond details
        // data-price now already contains base + tax + admin fee
        selectedDiamondPrice = parseFloat(this.getAttribute('data-price'));
        selectedDiamondCount = this.getAttribute('data-diamonds');

        // Determine the type based on the data-diamonds attribute
        if (selectedDiamondCount === 'Twilight Pass') {
            selectedDiamondType = 'Twilight Pass';
        } else if (selectedDiamondCount === 'Weekly Diamond Pass') {
            selectedDiamondType = 'Weekly Diamond Pass';
        } else {
            selectedDiamondType = selectedDiamondCount + ' Diamonds';
        }

        console.log(`Selected: ${selectedDiamondType} - Rp. ${selectedDiamondPrice}`);
    });
});

// --- Payment Method Selection Logic ---
document.querySelectorAll('.payment-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove 'selected' class from all payment items
        document.querySelectorAll('.payment-item').forEach(pi => pi.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        this.classList.add('selected');

        // Update selected payment method
        selectedPaymentMethod = this.getAttribute('data-method');
        console.log(`Selected Payment Method: ${selectedPaymentMethod}`);
    });
});

// --- Topup Now Button Logic ---
document.getElementById('mlbbTopupNowBtn').addEventListener('click', function() {
    handleTopup('mlbb');
});

document.getElementById('ffTopupNowBtn').addEventListener('click', function() {
    handleTopup('ff');
});

function handleTopup(game) {
    let userIDInput, zoneIDInput, emailInput;
    let userID, zoneID, email;

    if (game === 'mlbb') {
        userIDInput = document.getElementById('mlbbUserID');
        zoneIDInput = document.getElementById('mlbbZoneID');
        emailInput = document.getElementById('mlbbEmail');

        userID = userIDInput.value;
        zoneID = zoneIDInput.value;
        email = emailInput.value;

        if (!userID || !zoneID || !email) {
            showInfo("Mohon lengkapi User ID, Zone ID, dan Email Anda.");
            return;
        }
    } else if (game === 'ff') {
        userIDInput = document.getElementById('ffPlayerID');
        emailInput = document.getElementById('ffEmail');

        userID = userIDInput.value;
        email = emailInput.value;
        zoneID = ''; // FF does not have Zone ID

        if (!userID || !email) {
            showInfo("Mohon lengkapi Player ID dan Email Anda.");
            return;
        }
    }

    if (selectedDiamondPrice === 0) {
        showInfo("Mohon pilih nominal top up Diamond terlebih dahulu.");
        return;
    }

    if (!selectedPaymentMethod) {
        showInfo("Mohon pilih metode pembayaran terlebih dahulu.");
        return;
    }

    // selectedDiamondPrice already includes tax and admin fee
    const finalPrice = selectedDiamondPrice;

    let message = `🎮 Game : ${game === 'mlbb' ? 'Mobile Legends' : 'Free Fire'}\n`;
    message += `✉️ Email : ${email}\n`;
    message += `📄 ID : ${userID}\n`;
    if (game === 'mlbb') {
        message += `📋 Server ID : ${zoneID}\n`;
    }
    message += `💎 Topup : ${selectedDiamondType}\n`;
    // Display only the final price
    message += `💲 Harga : Rp. ${finalPrice.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n`;
    message += `📪 Metode : ${selectedPaymentMethod}`;

    // Updated WhatsApp number
    const whatsappNumber = '6288218776877';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
    showCustomAlert("Pesanan Terkirim!", "Detail pesanan Anda telah dikirimkan melalui WhatsApp.");

    // Optionally clear inputs after successful order
    if (game === 'mlbb') {
        document.getElementById('mlbbUserID').value = '';
        document.getElementById('mlbbZoneID').value = '';
        document.getElementById('mlbbEmail').value = '';
    } else if (game === 'ff') {
        document.getElementById('ffPlayerID').value = '';
        document.getElementById('ffEmail').value = '';
    }

    document.querySelectorAll('.diamond-item').forEach(item => item.classList.remove('selected'));
    document.querySelectorAll('.payment-item').forEach(item => item.classList.remove('selected'));
    selectedDiamondPrice = 0;
    selectedDiamondCount = '';
    selectedDiamondType = '';
    selectedPaymentMethod = '';
    selectedUserID = '';
    selectedZoneID = '';
    selectedEmail = '';
}
