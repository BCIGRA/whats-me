import { Router } from 'express';
import { initializeClient, getQrCode } from '../controllers/sessionController';

const router = Router();

router.post('/initialize/:number', initializeClient);
router.get('/qrcode/:number', getQrCode);

export default router;
