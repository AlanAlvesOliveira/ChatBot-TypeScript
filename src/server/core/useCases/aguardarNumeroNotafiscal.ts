import { ResultAction } from "../../interfaces/ResultAction";
import XcallyApiService from "../../services/XcallyApiService";
import Session from "../Session";

export async function aguardarNumeroNotafiscal(session: Session): Promise<ResultAction | undefined> {

    const numeroNota = session.parsedData.messageFromClient;

    //testa nova numeroNotafisca
    const notaLocaliada = true;
    if (!notaLocaliada) {



    }
    const dia = '';
    const valor = '';

    await XcallyApiService.SendMessage('aguardarNumeroNotafiscal', session, `Pronto! Localizei no meu sistema um boleto com vencimento para o dia ${dia}, no valor de ${valor}.  Abaixo, segue o boleto para o pagamento`)
    //envia boleto para xcally;
    //finaliza
    return;
}