import { Router } from 'express';
import { initializeClient, getQrCode, statusClient } from '../controllers/sessionController';

const router = Router();

router.post('/initialize/:number', initializeClient);
router.post('/qrcode/:number', getQrCode);
router.post('/status/:number', statusClient);

export default router;
