import XcallyApiService from "./XcallyApiService";
import { getConfiguration } from "../utils/loadConfiguration";

const configJson = getConfiguration();

interface QtdInteracoes {
    maximoAtingido: boolean;
    contactId?: string
    MAXIMO_INTERACOES?: number;
    INTERVALO_PARA_VERIFICACAO_EM_MINUTOS?: number;
}

export async function VerificaExcessoInteracoes(contactId: string): Promise<QtdInteracoes> {

    const total = await XcallyApiService.getTotalInteractionsByContatactId(contactId);

    // if (total.count && total.count > configJson.plugin.MAXIMO_INTERACOES) {
    //     return {
    //         contactId,
    //         maximoAtingido: true,
    //         MAXIMO_INTERACOES: configJson.plugin.MAXIMO_INTERACOES,
    //         INTERVALO_PARA_VERIFICACAO_EM_MINUTOS: configJson.plugin.INTERVALO_PARA_VERIFICACAO_EM_MINUTOS,
    //         tota_dentro_range: total.count
    //     }
    // }
    return {
        maximoAtingido: false,
    };
}