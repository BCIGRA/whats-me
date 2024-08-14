import express from 'express';
import cors from 'cors';  // Import cors
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
app.use('/api/v1.0', routerSession);
app.use('/api/v1.0', messageRoutes);
app.use('/api/v1.0', groupRoutes);

export default app;
