document.addEventListener('DOMContentLoaded', () => {
    const topupForm = document.getElementById('topupForm');
    const gameEmailInput = document.getElementById('gameEmail');
    const gameIdInput = document.getElementById('gameId');
    const serverIdInput = document.getElementById('serverId');
    const serverIdGroup = document.getElementById('serverIdGroup');
    // const diamondAmountSelect = document.getElementById('diamondAmount'); // Ini dihapus
    const diamondOptionsContainer = document.getElementById('diamondOptionsContainer'); // Container baru
    const totalPriceDisplay = document.getElementById('totalPrice');
    const gameButtons = document.querySelectorAll('.game-btn');
    const gameIdLabel = document.getElementById('gameIdLabel');

    let selectedGame = 'ml'; // Default game (Mobile Legends)
    let selectedDiamondPrice = 0; // Menyimpan harga diamond yang dipilih
    let selectedDiamondLabel = ''; // Menyimpan label diamond yang dipilih

    const TAX_RATE = 0.11; // 11% pajak
    const ADMIN_FEE = 2000; // Biaya admin Rp 2000
    const WHATSAPP_NUMBER = '6288218776877'; // Ganti dengan nomor WhatsApp kamu

    // --- HARGA DIAMOND DAN PRODUK LAINNYA ---
    const productData = {
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
            { id: "ml_100_bonus", label: "100 Diamonds (50+50) pengisian pertama!", basePrice: 14200 },
            { id: "ml_300_bonus", label: "300 Diamonds (150+150) pengisian pertama!", basePrice: 42350 },
            { id: "ml_500_bonus", label: "500 Diamonds (250+250) pengisian pertama!", basePrice: 70600 },
            { id: "ml_1000_bonus", label: "1000 Diamonds (500+500) pengisian pertama!", basePrice: 142000 },

            { id: "ml_3_d", label: "3 Diamonds", basePrice: 1171 },
            { id: "ml_5_d", label: "5 Diamonds", basePrice: 1423 },
            { id: "ml_12_d", label: "12 Diamonds (11 + 1 Bonus)", basePrice: 3323 },
            { id: "ml_19_d", label: "19 Diamonds (17 + 2 Bonus)", basePrice: 5223 },
            { id: "ml_28_d", label: "28 Diamonds (25 + 3 Bonus)", basePrice: 7600 },
            { id: "ml_44_d", label: "44 Diamonds (40 + 4 Bonus)", basePrice: 11400 },
            { id: "ml_59_d", label: "59 Diamonds (53 + 6 Bonus)", basePrice: 15200 },
            { id: "ml_85_d", label: "85 Diamonds (77 + 8 Bonus)", basePrice: 21850 },
            { id: "ml_170_d", label: "170 Diamonds (154 + 16 Bonus)", basePrice: 43700 },
            { id: "ml_240_d", label: "240 Diamonds (217 + 23 Bonus)", basePrice: 61750 },
            { id: "ml_296_d", label: "296 Diamonds (256 + 40 Bonus)", basePrice: 76000 },
            { id: "ml_408_d", label: "408 Diamonds (367 + 41 Bonus)", basePrice: 104500 },
            { id: "ml_568_d", label: "568 Diamonds (503 + 65 Bonus)", basePrice: 142500 },
            { id: "ml_875_d", label: "875 Diamonds (774 + 101 Bonus)", basePrice: 218500 },
            { id: "ml_2010_d", label: "2010 Diamonds (1708 + 302 Bonus)", basePrice: 475000 },
            { id: "ml_4830_d", label: "4830 Diamonds (4003 + 827 Bonus)", basePrice: 1140000 },

            { id: "ml_twilight_pass", label: "Twilight Pass", basePrice: 150000 },
            { id: "ml_weekly_diamond_pass", label: "Weekly Diamond Pass", basePrice: 27550 },
        ],
    };

    // --- Fungsi untuk memperbarui opsi diamond dalam bentuk kartu ---
    function updateDiamondOptions() {
        diamondOptionsContainer.innerHTML = ''; // Kosongkan container sebelumnya
        const gameProducts = productData[selectedGame === 'ml' ? 'Mobile Legends' : 'Free Fire'];
        
        gameProducts.forEach(product => {
            const diamondCard = document.createElement('div');
            diamondCard.classList.add('diamond-card');
            diamondCard.dataset.price = product.basePrice; // Simpan harga di data attribute
            diamondCard.dataset.label = product.label; // Simpan label di data attribute

            diamondCard.innerHTML = `
                <div class="diamond-amount">${product.label}</div>
                <div class="diamond-price">Rp ${product.basePrice.toLocaleString('id-ID')}</div>
            `;
            
            // Event listener untuk memilih kartu diamond
            diamondCard.addEventListener('click', () => {
                // Hapus kelas 'selected' dari semua kartu lain
                document.querySelectorAll('.diamond-card').forEach(card => {
                    card.classList.remove('selected');
                });
                // Tambahkan kelas 'selected' ke kartu yang diklik
                diamondCard.classList.add('selected');

                // Simpan harga dan label diamond yang dipilih
                selectedDiamondPrice = parseFloat(diamondCard.dataset.price);
                selectedDiamondLabel = diamondCard.dataset.label;
                calculateTotalPrice(); // Hitung ulang harga
            });

            diamondOptionsContainer.appendChild(diamondCard);
        });

        // Reset pilihan diamond saat ganti game
        selectedDiamondPrice = 0;
        selectedDiamondLabel = '';
        calculateTotalPrice(); // Set harga ke Rp 0
    }

    // --- Fungsi untuk menghitung harga total termasuk pajak dan biaya admin ---
    function calculateTotalPrice() {
        if (isNaN(selectedDiamondPrice) || selectedDiamondPrice === 0) {
            totalPriceDisplay.value = 'Rp 0';
            return;
        }
        const taxAmount = selectedDiamondPrice * TAX_RATE;
        const finalPrice = selectedDiamondPrice + taxAmount + ADMIN_FEE;
        totalPriceDisplay.value = `Rp ${finalPrice.toLocaleString('id-ID')}`;
    }

    // --- Event Listener untuk tombol game ---
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedGame = button.dataset.game;

            // Tampilkan/sembunyikan Server ID untuk ML
            if (selectedGame === 'ml') {
                serverIdGroup.style.display = 'block';
                serverIdInput.setAttribute('required', 'true');
            } else {
                serverIdGroup.style.display = 'none';
                serverIdInput.removeAttribute('required');
                serverIdInput.value = ''; // Kosongkan jika pindah ke FF
            }
            updateDiamondOptions(); // Perbarui tampilan diamond
        });
    });

    // --- Event Listener untuk submit form ---
    topupForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah form submit secara default

        // Validasi input
        if (!gameEmailInput.value || !gameIdInput.value) {
            alert('Mohon lengkapi Email dan ID Game Anda.');
            return;
        }

        if (selectedGame === 'ml' && !serverIdInput.value) {
            alert('Mohon lengkapi Server ID Anda untuk Mobile Legends.');
            return;
        }

        if (selectedDiamondPrice === 0 || selectedDiamondLabel === '') {
            alert('Mohon pilih paket Diamond Anda.');
            return;
        }

        const game = selectedGame === 'ml' ? 'Mobile Legends' : 'Free Fire';
        const email = gameEmailInput.value;
        const id = gameIdInput.value;
        const serverId = selectedGame === 'ml' ? serverIdInput.value : '-';
        
        const finalPrice = selectedDiamondPrice + (selectedDiamondPrice * TAX_RATE) + ADMIN_FEE;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        if (!paymentMethod) {
            alert('Mohon pilih metode pembayaran.');
            return;
        }

        // Format pesan untuk WhatsApp
        let message = `🎮 Game : ${game}\n`;
        message += `✉️ Email : ${email}\n`;
        message += `📄 ID : ${id}\n`;
        if (selectedGame === 'ml') {
            message += `📋 Server ID : ${serverId}\n`;
        }
        message += `💎 Diamond : ${selectedDiamondLabel}\n`; // Menggunakan selectedDiamondLabel
        message += `💲 Harga : Rp ${finalPrice.toLocaleString('id-ID')}\n`;
        message += `📪 Metode : ${paymentMethod}\n`;

        // Encode pesan untuk URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Buka link WhatsApp
        window.open(whatsappUrl, '_blank');

        alert('Pesanan Anda akan dikirim ke WhatsApp. Mohon lanjutkan di sana.');
        topupForm.reset(); // Reset form setelah submit
        updateDiamondOptions(); // Pastikan opsi diamond terupdate setelah reset
    });

    // Inisialisasi awal
    updateDiamondOptions();
    calculateTotalPrice();
});
