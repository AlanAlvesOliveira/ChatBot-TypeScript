import Session from "../core/Session";
import axios from "axios";
import { getConfiguration } from "../utils/loadConfiguration";
import { ResultAction } from "../interfaces/ResultAction";
import Message from "../interfaces/xcally-api/Message";

const configJson = getConfiguration();

export default class XcallyApiService {

    static async SendMessage(sessionData: Session, msg: string): Promise<ResultAction> {

        try {
            const data = {
                body: msg,
                OpenchannelAccountId: sessionData.getSessionData().accountId,
                OpenchannelInteractionId: sessionData.getSessionData().interactionId,
                direction: "out",
                secret: false,
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
            return { continuarFluxo: true, nextStep: undefined };
        } catch (error) {
            console.log('[ERR] SendMessage', error);
            return { continuarFluxo: false, nextStep: undefined };  // Garantir que a função retorne sempre algo.
        }
    }

    static async reOpenInteration(sessionData: Session): Promise<ResultAction> {

        try {

            const interactionId = sessionData.getSessionData().interactionId;
            const url = `${configJson.xcally.url}/api/openchannel/interactions/${interactionId}?apikey=${configJson.xcally.API_KEY} `

            const config = {
                method: "put",
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "closed": false,
                    "UserId": null,
                    "queueId": null,
                },
            };

            const response = await axios.request(config);

            return { continuarFluxo: true, nextStep: undefined };
        } catch (error) {
            console.log(error)
            return { continuarFluxo: false, nextStep: undefined };
        }
    }

    static async ChangeQueueAndNotify(sessionData: Session, queuesId: Number): Promise<ResultAction> {

        try {

            const interactionId = sessionData.getSessionData().interactionId;
            const lastMessage = await this.GetLastMessageFromOpenChannel(Number(interactionId));
            const url = `${configJson.xcally.url}/api/rpc/openchannel/queues/${queuesId}/notify?apikey=${configJson.xcally.API_KEY} `

            const config = {
                method: "post",
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "messageId": lastMessage?.id,
                    "channel": "openchannel"
                },
            };

            const response = await axios.request(config);

            return { continuarFluxo: true, nextStep: undefined };
        } catch (error) {
            console.log(error)
            return { continuarFluxo: false, nextStep: undefined };
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

    static async GetContext(interactionId: number): Promise<any> {
        try {
            const config = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${configJson.xcallyServidorAtendimento.url}/api/openchannel/interactions/${interactionId}?apikey=${configJson.xcallyServidorAtendimento.API_KEY}`,
                headers: {
                    "Content-Type": "application/json"
                },
            };

            const response = await axios.request(config);
            return response.data;

        } catch (error) {
            console.error('[ERR] GetMessagesFromOpenChannel interactionId: ', interactionId, error);
            return null; // ou algum valor padrão, dependendo do caso
        }
    }


    static async GetLastMessageFromOpenChannel(interactionId: number): Promise<Message | null> {
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
            const respostaJson = response.data;

            // Verifica se a resposta contém dados e se há mensagens
            if (!respostaJson || respostaJson.count === 0) {
                console.warn("Nenhuma nova mensagem encontrada.");
                return null;
            }

            // Filtra apenas as mensagens recebidas
            const mensagensRecebidas = respostaJson.rows.filter((msg: Message) => msg.direction === "in");

            // Se não houver mensagens recebidas, retorna null
            if (mensagensRecebidas.length === 0) {
                console.warn("Nenhuma mensagem recebida encontrada.");
                return null;
            }

            // Encontrar a última mensagem recebida
            const ultimaMensagem = mensagensRecebidas.reduce((max: Message, msg: Message) => (msg.id > max.id ? msg : max), mensagensRecebidas[0]);

            return ultimaMensagem || null;

        } catch (error) {
            console.log("[ERR] GetMessagesFromOpenChannel interactionId:", interactionId, error);
            return null;
        }
    }

}
