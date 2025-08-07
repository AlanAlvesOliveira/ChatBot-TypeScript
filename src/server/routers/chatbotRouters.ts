import express, { Request, Response, Router } from 'express';
import ChatController from '../controllers/ChatController';

const router: Router = express.Router();

router.post('/sendchatinteraction', ChatController.sendChatInteraction);
router.get('/sessions', ChatController.getSessions);

export default router;