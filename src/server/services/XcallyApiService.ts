import { response } from 'express';
import Session from "../core/Session";
import axios from "axios";
import { getConfiguration } from "../utils/loadConfiguration";
import SessionManager from "./SessionManager";
import { ResultAction } from "../interfaces/ResultAction";
import returnQtdInteractions from "../interfaces/xcally/returnQtdInteractions";
import fs from 'fs';
import FormData from 'form-data';


const configJson = getConfiguration();

export default class XcallyApiService {

    static async sendDocumentToClient(sessionData: Session, formData: any) {

        try {
            const data = {
                body: formData.name,
                AttachmentId: formData.id,
                OpenchannelAccountId: sessionData.getSessionData().accountId,
                OpenchannelInteractionId: sessionData.getSessionData().interactionId,
                direction: "out",
                secret: false,
                UserId: null,
                sentBy: "auto_routing",
                ContactId: sessionData.getSessionData().contactId,
            };

            console.log("[INFO] ~ sendDocumentToClient ~ data:", data);

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

            console.log('sendfile ', response.data)

            return response.data;
        } catch (error) {
            console.log(error);
        }
    };


    static async createAttachment(caminhoDoPDF: string) {

        const URL = `${configJson.xcally.url}/api/attachments?apikey=${configJson.xcally.API_KEY}`;
        const formData = new FormData();

        try {
            formData.append('file', fs.createReadStream(caminhoDoPDF));

            const response = await axios.post(URL, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            fs.unlinkSync(caminhoDoPDF)
            console.log(`arquivo removido ${caminhoDoPDF}`);

            console.log("response de createAttachment", response.data);
            return response.data;
        } catch (error) {
            console.log("[ERROR] ~ createAttachment " + formData + " ~ error:", error);

        }
    };

    static async SendMessage(context: string, sessionData: Session, msg: string, secret: boolean = false): Promise<ResultAction> {
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
            return { success: true };

        } catch (error) {
            // Tratamento para erros do Axios
            if (axios.isAxiosError(error)) {
                // Erro 500 com mensagem específica de constraint
                if (error.response?.status === 500 &&
                    error.response?.data?.message?.includes('foreign key constraint fails')) {
                    // console.error('[ERR] SendMessage - Foreign key constraint violation:', {
                    //     code: error.response?.data?.code,
                    //     message: error.response?.data?.message,
                    //     details: error.response?.data?.details
                    // });
                    sessionData.clearTimeoutsAndRemoveFromMemory(`${context} erro SendMessage `);
                    return {
                        success: false,
                        error: 'Database constraint violation'
                    };
                }

                // Outros erros HTTP
                console.error('[ERR] SendMessage - API Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    config: error.config
                });
                return {
                    success: false,
                    error: error.response?.data?.message || 'API request failed'
                };
            }

            // Erros não relacionados ao Axios
            console.error('[ERR] SendMessage - Unexpected error:', error);
            return {
                success: false,
                error: 'Unexpected error occurred'
            };
        }
    }


    static async addTag(session: Session, novoIdsTag: number) {


        try {
            const interactionID = session.parsedData.interactionId;

            let novasTags = [];
            const apiToken = configJson.xcally.API_KEY

            //É necessário pegar as outras tags que já tinham sido adicionadas anteriormente
            const configGet = {
                method: "GET",
                maxBodyLength: Infinity,
                url: `${configJson.xcally.url}/api/openchannel/interactions/${interactionID}?apikey=${apiToken}&includeAll=true`,
                //url: `${systemConfiguration[0].ROOT_URL}/api/openchannel/interactions/${interactionID}?apikey=${systemConfiguration[0].APIKEY}&includeAll=true`,
                headers: {
                    "Content-Type": "application/json"
                },
            };

            const response = await axios.request(configGet);

            if (response.data && response.data.Tags && response.data.Tags.length > 0) {
                console.log('-> Pegando tags antigas ', response.data.Tags);
                novasTags = response.data.Tags.map((item: { id: string | number }) => item.id.toString());
            }

            //adiciona as novas tags para fazer o post
            novasTags.push(novoIdsTag.toString())

            const configPost = {
                method: "post",
                url: `${configJson.xcally.url}/api/openchannel/interactions/${interactionID}/tags?apikey=${apiToken}`,
                headers: {
                    "Content-Type": "application/json"
                },
                data: { ids: novasTags },
            };

            const response2 = await axios.request(configPost);
            return response2;

        } catch (error) {
            console.log(`[ERRO] addTag`, error);
        }

    }




    static async getTotalInteractionsByContatactId(contactId: string): Promise<returnQtdInteractions> {
        {
            try {

                if (!contactId) throw new Error('Contact Id é obrigatório');

                const url = new URL(`${configJson.xcally.url}/api/openchannel/interactions`);
                url.searchParams.append('OpenchannelAccountId', configJson.xcally.ID_OPEN_CHANNEL.toString());

                const hoje = new Date();
                const dataInicial = new Date(hoje);

                const minutos = configJson.plugin.INTERVALO_PARA_VERIFICACAO_EM_MINUTOS;
                if (!minutos) throw new Error('Verique se existe INTERVALO_PARA_VERIFICACAO_EM_MINUTOS no config.json');

                dataInicial.setMinutes(dataInicial.getMinutes() - minutos);
                const dataFinal = new Date(hoje);
                const createdAt = {
                    $gte: dataInicial.toISOString(), // Ex: "2023-11-15T00:00:00.000Z"
                    $lte: dataFinal.toISOString()    // Ex: "2023-11-15T23:59:59.999Z"
                };

                new Date().toISOString()
                url.searchParams.append('createdAt', JSON.stringify(createdAt));

                url.searchParams.append('limit', '1');
                url.searchParams.append('offset', '0');
                url.searchParams.append('page', '1');
                url.searchParams.append('search', `[$and]Contact:=$eq[${contactId}]||OpenchannelAccountId:=$eq[${configJson.xcally.ID_OPEN_CHANNEL}]`);
                url.searchParams.append('apikey', configJson.xcally.API_KEY);

                const response = await axios.get(url.toString());

                return {
                    success: true,
                    count: response.data.count
                }
            } catch (error) {
                // Tratamento para erros do Axios
                if (axios.isAxiosError(error)) {
                    console.error('[ERR] getInteractions - API Error:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        config: error.config
                    });
                    return {
                        success: false,
                        error: error.response?.data?.message || 'API request failed'
                    };
                }

                // Erros não relacionados ao Axios
                console.error('[ERR] getInteractions - Unexpected error:', error);
                return {
                    success: false,
                    error: 'Unexpected error occurred'
                };
            }
        }
    }

    static async CloseInteration(context: string, sessionData: Session) {

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
            if (axios.isAxiosError(error)) {
                // Erro 500 com mensagem específica de constraint
                if (error.response?.status === 500 &&
                    error.response?.data?.message?.includes('foreign key constraint fails')) {
                    // console.error('[ERR] SendMessage - Foreign key constraint violation:', {
                    //     code: error.response?.data?.code,
                    //     message: error.response?.data?.message,
                    //     details: error.response?.data?.details
                    // });
                    sessionData.clearTimeoutsAndRemoveFromMemory(`${context} erro CloseInteration `);
                    return {
                        success: false,
                        error: 'Database constraint violation'
                    };
                }

                // Outros erros HTTP
                console.error('[ERR] SendMessage - API Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    config: error.config
                });
                return {
                    success: false,
                    error: error.response?.data?.message || 'API request failed'
                };
            }

            // Erros não relacionados ao Axios
            console.error('[ERR] SendMessage - Unexpected error:', error);
            return {
                success: false,
                error: 'Unexpected error occurred'
            };
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
