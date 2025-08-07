import { Request, response, Response } from "express";
import ChatService from "../services/ChatService";
import SessionManager from "../services/SessionManager";
import ParsedHandle from "../utils/parsedDataFromXcallyHandle";

export default class ChatController {

    static async sendChatInteraction(req: Request, res: Response) {

        try {


            const parsedData = ParsedHandle.parsedDataHandleFromValue(req);
            console.log('sendChatInteraction -> ', parsedData);
            await ChatService.flow(parsedData);
            res.status(200).send("sucesso");

        } catch (error: any) {
            console.log("ERROR: ", error);
        }
    }

    static async getSessions(req: Request, res: Response) {

        try {

            res.status(200).send(SessionManager.getSessionKeys());

        } catch (error: any) {
            console.log("ERROR: ", error);
            res.status(400).json({ message: error.message });
        }
    }
}