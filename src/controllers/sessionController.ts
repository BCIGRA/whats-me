import { Request, Response } from 'express';
import { SessionClient } from '../services/sessionClient';

// Fungsi untuk menunggu status sesi
const waitForClientState = (client: any): Promise<boolean> => {
    return new Promise((resolve) => {
        client.getState()
            .then((state: boolean) => resolve(state))
            .catch(() => resolve(false));
    });
};

// Fungsi untuk mendapatkan status dari client
export const statusClient = async (req: Request, res: Response) => {
    const { number } = req.params;

    try {
        const sessionClient = SessionClient.createClient(number);
        const client = sessionClient.getWhatsAppClient();

        if (!client) {
            // Jika client tidak ada, kirimkan respons bahwa client belum terdaftar
            return res.status(404).json({
                message: `Client dengan nomor ${number} belum terdaftar`,
                status: `notfound`
            });
        }

        console.log(`Mengambil Status Untuk ${number}`);

        // Periksa status sesi
        const state = await waitForClientState(client);

        if (state) {
            // Jika sesi sudah aktif
            return res.status(200).json({
                message: `Client dengan nomor ${number} sudah terhubung dan aktif`,
                status: `${state}`
            });
        } else {
            // Jika sesi belum aktif
            return res.status(200).json({
                message: `Client dengan nomor ${number} terdaftar tetapi belum terhubung. Harap scan QR code untuk aktivasi`,
                status: `${state}`
            });
        }
    } catch (error) {
        res.status(500).send('Failed to get client status: ' + (error as Error).message);
    }
};

export const initializeClient = async (req: Request, res: Response) => {
    const { number } = req.params;

    try {
        const sessionClient = SessionClient.createClient(number);
        const client = sessionClient.getWhatsAppClient();

        if (!client) {
            // Jika client tidak ada, kirimkan respons kesalahan
            return res.status(500).send('Client not found');
        }

        console.log(`Mengatur Sesi Untuk ${number}`);

        // Periksa status sesi
        const state = await waitForClientState(client);

        if (state) {
            // Jika sesi sudah aktif, kirim respons tanpa QR code
            return res.status(200).json({
                message: `Sesi sudah aktif untuk nomor ${number}`,
                status: `${state}`
            });
        } else {
            // Jika client ada tetapi sesi belum aktif, kirimkan respons sukses
            return res.status(200).json({
                message: `Sesi sudah dibuat untuk nomor ${number} tetapi belum aktif. Scan QR code untuk aktivasi`,
                status: `${state}`
            });
        }
    } catch (error) {
        res.status(500).send('Failed to initialize client: ' + (error as Error).message);
    }
};

// Fungsi untuk menunggu hingga QR code tersedia
const waitForQrCode = (client: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        client.once('qr', resolve);
        client.once('auth_failure', (msg: string) => reject(new Error('Authentication failed: ' + msg)));
    });
};

export const getQrCode = async (req: Request, res: Response) => {
    const { number } = req.params;

    try {
        const sessionClient = SessionClient.createClient(number);
        const client = sessionClient.getWhatsAppClient();

        if (!client) {
            return res.status(500).send('Client not found');
        }
        
        console.log(`Mengambil QRcode Untuk ${number}`);

        // Periksa status sesi
        const state = await waitForClientState(client);

        if (state) {
            // Jika sesi sudah aktif, kirim respons tanpa QR code
            return res.status(200).json({
                message: `Sesi sudah aktif untuk nomor ${number}`,
                status: `${state}`
            });
        }

        // Tunggu hingga QR code tersedia
        const qrCode = await waitForQrCode(client);
        const qrCodeUrl = await sessionClient.generateQRCodeWithLogo(qrCode);

        res.status(200).json({
            message: `Scan QR code untuk login dengan nomor ${number}`,
            status: `${state}`,
            qrCodeUrl
        });

    } catch (error) {
        res.status(500).send('Failed to get QR code: ' + (error as Error).message);
    }
};
