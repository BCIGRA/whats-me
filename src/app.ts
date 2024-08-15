import express from 'express';
import cors from 'cors';  // Import cors
import path from 'path';
import routerSession from './routes/sessionRoutes';
import messageRoutes from './routes/messageRoutes';
import groupRoutes from './routes/groupRoutes';

const app = express();

// Konfigurasi middleware CORS
const corsOptions = {
    origin: '*', // Anda bisa menyesuaikan ini untuk membatasi asal yang diizinkan
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions)); // Gunakan cors dengan konfigurasi
app.use(express.json());

// Middleware untuk file statis
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Rute API
app.use('/api/v1.0', routerSession);
app.use('/api/v1.0', messageRoutes);
app.use('/api/v1.0', groupRoutes);

// Middleware untuk menangani permintaan yang tidak cocok dengan rute API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
