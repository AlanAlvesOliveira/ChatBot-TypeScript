import express, { Request, Response, Router } from 'express';
import ChatController from '../controllers/ChatController';
import BoletosCotroller from '../controllers/BoletosCotroller';

const router: Router = express.Router();

router.post('/sendchatinteraction', ChatController.sendChatInteraction);
router.get('/sessions', ChatController.getSessions);
router.get('/teste', BoletosCotroller.Teste);

export default router;