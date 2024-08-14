import { Client, GroupChat, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

export class SessionClient {
    private static clients: { [key: string]: SessionClient } = {};
    private client: Client;

    private constructor(private number: string) {
        this.client = new Client({
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-software-rasterizer'
                ],
                ignoreDefaultArgs: ['--disable-extensions'],
                executablePath: '/usr/bin/google-chrome',
                dumpio: true
            },
            authStrategy: new LocalAuth({
                clientId: this.number
            })
        });

        this.initializeClient();
    }

    public static getClient(number: string): SessionClient | undefined {
        return this.clients[number];
    }

    public static createClient(number: string): SessionClient {
        if (!this.clients[number]) {
            this.clients[number] = new SessionClient(number);
        }
        return this.clients[number];
    }

    private initializeClient(): void {
        this.client.initialize();

        this.client.on('authenticated', () => {
            console.log(`Authenticated for ${this.number}`);
        });

        this.client.on('auth_failure', (msg: string) => {
            console.error(`Authentication failed for ${this.number}:`, msg);
        });

        this.client.on('ready', () => {
            console.log(`Client is ready for ${this.number}!`);
        });

        this.client.on('disconnected', (reason: string) => {
            console.log(`Client disconnected for ${this.number}:`, reason);
            // Hapus sesi dari cache
            this.cleanupSession();
        });
    }

    private cleanupSession(): void {
        // Hapus sesi dari cache
        delete SessionClient.clients[this.number];
    }

    public async generateQRCodeWithLogo(qr: string): Promise<string> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(qr, { type: 'image/png' });
            const qrImage = await loadImage(qrCodeDataUrl);
            const canvas = createCanvas(qrImage.width, qrImage.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(qrImage, 0, 0);

            const logoPath = path.join(__dirname, '../../assets/logo.png');
            if (!fs.existsSync(logoPath)) {
                throw new Error('Logo file not found.');
            }
            const logo = await loadImage(logoPath);

            const logoSize = qrImage.width / 5;
            const logoX = (qrImage.width - logoSize) / 2;
            const logoY = (qrImage.height - logoSize) / 2;

            ctx.fillStyle = '#006400'; // Dark green color
            ctx.beginPath();
            ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

            return canvas.toDataURL();
        } catch (error) {
            console.error('Error generating QR code with logo:', error);
            throw error;
        }
    }

    public getWhatsAppClient(): Client {
        return this.client;
    }

    public async getGroupChat(groupID: string): Promise<GroupChat | undefined> {
        const chat = await this.client.getChatById(groupID);
        return chat as GroupChat;
    }
}
