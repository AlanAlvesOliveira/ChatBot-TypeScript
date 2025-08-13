import axios from "axios";
import Session from "../core/Session";
import { getConfiguration } from "../utils/loadConfiguration";
import { ResultAction } from "../interfaces/ResultAction";

const configJson = getConfiguration();

export default class ItauApiService {


    static async GetToken(context: string, sessionData: Session): Promise<ResultAction> {
        try {
            const data = {

            };

            const url = `${configJson.itau.url}/api/openchannel/messages?apikey`;

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

}