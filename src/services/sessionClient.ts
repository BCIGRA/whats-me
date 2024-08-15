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
                dumpio: false
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
        
        this.client.on('loading_screen', (percent, message) => {
            console.log(`LOADING SCREEN ${this.number}!`, percent, message);
        });

        this.client.on('message', async msg => {
            console.log('MESSAGE RECEIVED', msg);
        })

        this.client.on('disconnected', (reason: string) => {
            console.log(`Client disconnected for ${this.number}:`, reason);
            // Contoh penggunaan
            const folderPath = `../.wwebjs_auth/session-${this.number}`;
            // Hapus sesi dari cache
            this.deleteFolderRecursive(folderPath);
        });
    }

    private deleteFolderRecursive = (folderPath: string) => {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.statSync(curPath).isDirectory()) {
                    // Rekursif untuk folder
                    this.deleteFolderRecursive(curPath);
                } else {
                    // Hapus file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
    };

    public async generateQRCodeWithLogo(qr: string): Promise<string> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(qr, { type: 'image/png' });
            const qrImage = await loadImage(qrCodeDataUrl);
            const canvas = createCanvas(qrImage.width, qrImage.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(qrImage, 0, 0);

            // Load WhatsApp logo from URL
            const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
            const logo = await loadImage(logoUrl);

            // Calculate logo position and size
            const logoSize = 50;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;

            // Draw the logo in the center of the QR code
            ctx.drawImage(logo, x, y, logoSize, logoSize);

            // Convert the canvas to a Data URL
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
