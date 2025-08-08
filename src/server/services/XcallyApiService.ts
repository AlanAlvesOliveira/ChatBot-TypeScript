import Session from "../core/Session";
import axios from "axios";
import { getConfiguration } from "../utils/loadConfiguration";

const configJson = getConfiguration();

export default class XcallyApiService {

    static async SendMessage(sessionData: Session, msg: string, secret: boolean = false): Promise<void> {

        try {

            const data = {
                body: msg,
                OpenchannelAccountId: sessionData.getSessionData().accountId,
                OpenchannelInteractionId: sessionData.getSessionData().interactionId,
                direction: "out",
                secret,
                UserId: null,
                sentBy: "auto_routing",
                ContactId: sessionData.getSessionData().contactId,
            };

            const url = `${configJson.xcally.url}/api/openchannel/messages?apikey=${configJson.xcally.API_KEY}`;

            const config = {
                method: "post",
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: data,
            };

            const response = await axios.request(config);
        } catch (error) {
            console.log('[ERR] SendMessage', error);
        }
    }



    static async CloseInteration(sessionData: Session) {

        try {

            const interactionId = sessionData.getSessionData().interactionId;

            const config = {
                method: "put",
                maxBodyLength: Infinity,
                url: `${configJson.xcally.url}/api/openchannel/interactions/${interactionId}?apikey=${configJson.xcally.API_KEY}`,
                headers: {
                    "Content-Type": "application/json"
                },
                data: { closed: true, disposition: "Timeout_Conversa" },
            };

            const response = await axios.request(config);
        } catch (error) {
            console.log('[ERR] CloseInteration ', sessionData.getSessionData().composedSessionId)
        }
    }

    static async GetMessagesFromOpenChannel(interactionId: number) {

        try {
            const config = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${configJson.xcally.url}/api/openchannel/interactions/${interactionId}/messages?apikey=${configJson.xcally.API_KEY}`,
                headers: {
                    "Content-Type": "application/json"
                },
            };

            const response = await axios.request(config);

            return response.data;

        } catch (error) {
            console.log('[ERR] GetMessagesFromOpenChannel interactionId: ', interactionId);
        }
    }




}
