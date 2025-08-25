import XcallyApiService from "./XcallyApiService";
import { getConfiguration } from "../utils/loadConfiguration";

const configJson = getConfiguration();

interface QtdInteracoes {
    maximoAtingido: boolean;
    contactId?: string
    MAXIMO_INTERACOES_24_HORAS?: number;
    QUANTIDADE_ULTIMAS_24_HORAS?: number

}

export async function VerificaExcessoInteracoes(contactId: string): Promise<QtdInteracoes> {

    const response = await XcallyApiService.getTotalInteractionsByContatactId(contactId);

    if (response.count && response.count > configJson.plugin.MAXIMO_INTERACOES_24_HORAS) {
        return {
            contactId,
            maximoAtingido: true,
            MAXIMO_INTERACOES_24_HORAS: configJson.plugin.MAXIMO_INTERACOES_24_HORAS,
            QUANTIDADE_ULTIMAS_24_HORAS: response.count
        }
    }
    return {
        maximoAtingido: false,
    };
}