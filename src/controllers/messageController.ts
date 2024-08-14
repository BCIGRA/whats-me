import { Request, Response } from 'express';
import { SessionClient } from '../services/sessionClient';
import { MessageMedia, Location } from 'whatsapp-web.js';
import fs from 'fs';
import request from 'request';
import vuri from 'valid-url';

// Fungsi untuk mendownload media
const mediadownloader = (url: string, path: string, callback: () => void) => {
    request.head(url, (err) => {
        request(url).pipe(fs.createWriteStream(path)).on('close', callback);
    });
};

// Fungsi untuk mengirim pesan
export const sendMessage = async (req: Request, res: Response) => {
    const { sessionID, phone } = req.params;
    const { message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ status: 'error', message: 'please enter valid phone and message' });
    }

    const sessionClient = SessionClient.getClient(sessionID);
    if (!sessionClient) {
        return res.status(500).json({ status: 'error', message: 'Client not found' });
    }

    const client = sessionClient.getWhatsAppClient();

    try {
        const response = await client.sendMessage(`${phone}@c.us`, message);
        if (response.id.fromMe) {
            res.json({ status: 'success', message: `Message successfully sent to ${phone}` });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send message: ' + (error as Error).message });
    }
};

// Fungsi untuk mengirim gambar
export const sendImage = async (req: Request, res: Response) => {
    const { sessionID, phone } = req.params;
    const { image, caption } = req.body;
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    if (!phone || !image) {
        return res.status(400).json({ status: 'error', message: 'please enter valid phone and base64/url of image' });
    }

    const sessionClient = SessionClient.getClient(sessionID);
    if (!sessionClient) {
        return res.status(500).json({ status: 'error', message: 'Client not found' });
    }

    const client = sessionClient.getWhatsAppClient();

    try {
        if (base64regex.test(image)) {
            const media = new MessageMedia('image/png', image);
            const response = await client.sendMessage(`${phone}@c.us`, media, { caption: caption || '' });
            if (response.id.fromMe) {
                res.json({ status: 'success', message: `MediaMessage successfully sent to ${phone}` });
            }
        } else if (vuri.isWebUri(image)) {
            const tempPath = `./temp/${image.split('/').pop()}`;
            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp');
            }

            mediadownloader(image, tempPath, async () => {
                const media = MessageMedia.fromFilePath(tempPath);
                const response = await client.sendMessage(`${phone}@c.us`, media, { caption: caption || '' });
                if (response.id.fromMe) {
                    res.json({ status: 'success', message: `MediaMessage successfully sent to ${phone}` });
                }
                fs.unlinkSync(tempPath);
            });
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send image: ' + (error as Error).message });
    }
};

// Fungsi untuk mengirim PDF
export const sendPdf = async (req: Request, res: Response) => {
    const { sessionID, phone } = req.params;
    const { pdf } = req.body;
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    if (!phone || !pdf) {
        return res.status(400).json({ status: 'error', message: 'please enter valid phone and base64/url of pdf' });
    }

    const sessionClient = SessionClient.getClient(sessionID);
    if (!sessionClient) {
        return res.status(500).json({ status: 'error', message: 'Client not found' });
    }

    const client = sessionClient.getWhatsAppClient();

    try {
        if (base64regex.test(pdf)) {
            const media = new MessageMedia('application/pdf', pdf);
            const response = await client.sendMessage(`${phone}@c.us`, media);
            if (response.id.fromMe) {
                res.json({ status: 'success', message: `MediaMessage successfully sent to ${phone}` });
            }
        } else if (vuri.isWebUri(pdf)) {
            const tempPath = `./temp/${pdf.split('/').pop()}`;
            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp');
            }

            mediadownloader(pdf, tempPath, async () => {
                const media = MessageMedia.fromFilePath(tempPath);
                const response = await client.sendMessage(`${phone}@c.us`, media);
                if (response.id.fromMe) {
                    res.json({ status: 'success', message: `MediaMessage successfully sent to ${phone}` });
                }
                fs.unlinkSync(tempPath);
            });
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send PDF: ' + (error as Error).message });
    }
};

// Fungsi untuk mengirim lokasi
export const sendLocation = async (req: Request, res: Response) => {
    const { sessionID, phone } = req.params;
    const { latitude, longitude, description } = req.body;

    if (!phone || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ status: 'error', message: 'please enter valid phone, latitude and longitude' });
    }

    const sessionClient = SessionClient.getClient(sessionID);
    if (!sessionClient) {
        return res.status(500).json({ status: 'error', message: 'Client not found' });
    }

    const client = sessionClient.getWhatsAppClient();

    try {
        const location = new Location(latitude, longitude, description || '');
        const response = await client.sendMessage(`${phone}@c.us`, location);
        if (response.id.fromMe) {
            res.json({ status: 'success', message: `Location successfully sent to ${phone}` });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send location: ' + (error as Error).message });
    }
};

// Fungsi untuk mengirim pesan ke grup
export const sendGroup = async (req: Request, res: Response) => {
    const { sessionID, groupID } = req.params;
    const { message } = req.body;

    if (!groupID || !message) {
        return res.status(400).json({ status: 'error', message: 'please enter valid groupID and message' });
    }

    const sessionClient = SessionClient.getClient(sessionID);
    if (!sessionClient) {
        return res.status(500).json({ status: 'error', message: 'Client not found' });
    }

    const client = sessionClient.getWhatsAppClient();

    try {
        const response = await client.sendMessage(`${groupID}@g.us`, message);
        if (response.id.fromMe) {
            res.json({ status: 'success', message: `Message successfully sent to group ${groupID}` });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send message to group: ' + (error as Error).message });
    }
};
