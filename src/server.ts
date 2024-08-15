import app from './app';
import { SessionClient } from './services/sessionClient';
import path from 'path';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const SESSIONS_DIR = path.join(__dirname, '../.wwebjs_auth');

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    const numbers = getSessionNumbers(SESSIONS_DIR);

    for (const number of numbers) {
        try {
            const sessionClient = SessionClient.createClient(number);
            const client = sessionClient.getWhatsAppClient();     
            if (client) {
                console.log(`Client for ${number} is try authenticated`);
            } else {
                console.log(`Failed to authenticate client for ${number}.`);
            }
        } catch (error) {
            console.error(`Error initializing client for ${number}:`, (error as Error).message);
        }
    }
});

/**
 * Mendapatkan nomor sesi dari file yang ada dalam direktori.
 * @param dir - Path direktori yang akan dipindai
 * @returns Daftar nomor sesi yang ditemukan
 */
const getSessionNumbers = (dir: string): string[] => {
    // Memeriksa apakah path adalah direktori
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        console.error(`Path ${dir} tidak ada atau bukan direktori.`);
        return [];
    }

    // Membaca daftar file dari direktori
    const files = fs.readdirSync(dir);

    // Mengekstrak nomor sesi dari nama file dengan format tertentu
    const numbers = files.map(file => {
        // Contoh regex untuk file dengan format 'session-123.txt'
        const match = file.match(/session-(\d+)/);
        return match ? match[1] : null;
    }).filter(number => number !== null);

    return numbers as string[];
};
