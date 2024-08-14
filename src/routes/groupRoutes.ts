import { Router } from 'express';
import { GroupController } from '../controllers/groupControler';

const router = Router();

router.post('/create', GroupController.createGroup);
router.post('/add-participants', GroupController.addParticipants);
router.post('/remove-participants', GroupController.removeParticipants);
router.post('/leave', GroupController.leaveGroup);
router.post('/get-contact', GroupController.getContact);

export default router;
