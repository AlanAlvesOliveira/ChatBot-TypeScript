import { StoredStep } from "../../interfaces/StoredStep";
import XcallyApiService from "../../services/XcallyApiService";
import Session from "../Session";

export async function aguardarNumeroNotafiscal(session: Session, nextStep: string): Promise<StoredStep | undefined> {

    const msgOriginal = session.parsedData.messageFromClient;
    const msg = msgOriginal.replace(/\D/g, '');

    if (!ValidaNotaFiscal(msg)) {

        session.sessionDb.countAnswerError++;
        await session.sessionDb.save();

        if (session.sessionDb.countAnswerError > 2) {
            await XcallyApiService.SendMessage("flow - aguardaCpfOuCnpj", session, `Olha, como não consegui validar a nota fiscal, estou te transferindo para um dos nossos colaboradores.`);
            await session.encaminhaFila('queue');
        } else {
            await XcallyApiService.SendMessage('aguardaCpfOuCnpj', session, `Desculpa, mas o dado informado está 
invalido.  Vamos tentar novamente?

Informe o numero da nota fiscal (somente números), apenas números,  
para que eu possa consultar seus boletos...`);
        }

        return; //não faz mais nada
    }

    session.sessionDb.countAnswerError = 0;
    await session.sessionDb.save();

    await session.updateDadosDatabase({ notaFiscal: msg });

    const result = await session.updateStatusInBd(nextStep);
    if (result.success) {
        return session.getCurrentStep();
    } else {
        console.log('não consegui achar no novo passo no aguarda cpf ou cnpj (nota fiscal)')
        return undefined;

    }
}

function ValidaNotaFiscal(nota: string) {
    //TODO
    return true;
}