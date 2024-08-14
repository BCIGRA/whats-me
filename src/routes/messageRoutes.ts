import { Router } from 'express';
import { sendMessage, sendImage, sendPdf, sendLocation, sendGroup } from '../controllers/messageController';

const router = Router();

// Menghubungkan rute dengan fungsi dari controller
router.post('/sendmessage/:sessionID/:phone', sendMessage);
router.post('/sendimage/:sessionID/:phone', sendImage);
router.post('/sendpdf/:sessionID/:phone', sendPdf);
router.post('/sendlocation/:sessionID/:phone', sendLocation);
router.post('/sendgroup/:sessionID/:groupID', sendGroup);

export default router;
