let countdownInterval;
let fetchInterval;
let countdownTime = 30;

const qrImage = document.getElementById('qrImage');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const countdownElement = document.getElementById('countdown');
const statusMessage = document.getElementById('statusMessage');
const sessionForm = document.getElementById('session-form');
const generateQRButton = document.getElementById('generateQRButton');
const qrModal = $('#qrModal');

// Memeriksa status koneksi
const checkConnectionStatus = async (sessionId) => {
    try {
        const response = await fetch(`api/v1.0/status/${sessionId}`, { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            if (data.status === 'CONNECTED') {
                return true;
            } else {
                return false;
            }
        } else {
            errorMessage.textContent = data.message || 'Error checking connection status.';
            return false;
        }
    } catch (error) {
        errorMessage.textContent = 'Error checking connection status.';
        return false;
    }
};

// Memulai countdown di modal
const startCountdown = () => {
    countdownInterval = setInterval(() => {
        countdownElement.textContent = `Refreshing in ${countdownTime} seconds...`;
        countdownTime--;

        if (countdownTime < 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = '';
            fetchQRCode(document.getElementById('sessionInput').value);
        }
    }, 1000);
};

const fetchQRCode = async (sessionId) => {
    const isConnected = await checkConnectionStatus(sessionId);

    if (isConnected === true) {
        qrImage.style.display = 'none';
        statusMessage.style.display = 'block';
        return;
    } else {
        loading.style.display = 'block';
        qrImage.style.display = 'none';
        statusMessage.style.display = 'none';

        try {
            const response = await fetch(`api/v1.0/qrcode/${sessionId}`, { method: 'POST' });
            const data = await response.json();

            console.log('Response Data:', data); // Log data untuk pemecahan masalah

            if (response.ok && data.qrCodeUrl) {
                if (!data.qrCodeUrl.startsWith('data:image/png;base64,')) {
                    data.qrCodeUrl = 'data:image/png;base64,' + data.qrCodeUrl;
                }

                qrImage.src = data.qrCodeUrl;
                qrImage.style.display = 'block';
                console.log('QR Code URL:', qrImage.src); // Log URL gambar

                countdownTime = 30;
                clearInterval(countdownInterval);
                startCountdown();

                clearInterval(fetchInterval);
                fetchInterval = setInterval(async () => {
                    const isStillConnected = await checkConnectionStatus(sessionId);
                    if (!isStillConnected) {
                        fetchQRCode(sessionId);
                    } else {
                        clearInterval(fetchInterval);
                    }
                }, 30000);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error generating QR code.',
                    text: data.message
                });
            }
        } catch (error) {
            qrImage.style.display = 'none';
            Swal.fire({
                icon: 'error',
                title: 'Error fetching QR code',
                text: error.message || 'An error occurred'
            });
        } finally {
            loading.style.display = 'none';
        }
    }
};

// Menginisialisasi sesi
const initializeSession = async (sessionId) => {
    loading.style.display = 'block';

    try {
        const response = await fetch(`api/v1.0/initialize/${sessionId}`, { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            generateQRButton.style.display = 'block';
            Swal.fire({
                icon: 'success',
                title: 'Session initialized. Please generate QR code.',
                text: data.message
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error initializing session.',
                text: data.message
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error initializing session.',
            text: data.message
        });
    } finally {
        loading.style.display = 'none';
    }
};

// Menangani submit form sesi
const sessionFormSubmit = async (event) => {
    event.preventDefault();

    const sessionId = document.getElementById('sessionInput').value;

    clearInterval(fetchInterval);
    clearInterval(countdownInterval);

    await initializeSession(sessionId);
};

// Menangani klik tombol generate QR
const generateQRButtonClick = async () => {
    const sessionId = document.getElementById('sessionInput').value;

    clearInterval(fetchInterval);
    clearInterval(countdownInterval);

    await fetchQRCode(sessionId);
};

// Menangani klik tombol close di modal
const handleModalClose = () => {
    clearInterval(countdownInterval);
    clearInterval(fetchInterval);
    generateQRButton.style.display = 'none'
};

// Menambahkan event listener
sessionForm?.removeEventListener('submit', sessionFormSubmit);
sessionForm?.addEventListener('submit', sessionFormSubmit);

generateQRButton?.removeEventListener('click', generateQRButtonClick);
generateQRButton?.addEventListener('click', generateQRButtonClick);

qrModal.on('hide.bs.modal', handleModalClose);

// Event listener untuk form kirim pesan
document.getElementById('sendMessageForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const sessionInput = document.getElementById('sesInput').value;
    const phoneInput = document.getElementById('phoneInput').value;
    const messageInput = document.getElementById('messageInput').value;

    try {
        const response = await fetch(`api/v1.0/sendmessage/${sessionInput}/${phoneInput}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageInput })
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim Pesan',
                text: data.message || 'Terjadi kesalahan saat mengirim pesan'
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Pesan Berhasil Dikirim',
                text: data.message || 'Pesan Anda telah dikirim!'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengirim Pesan',
            text: 'Terjadi kesalahan saat mengirim pesan'
        });
    }
});
