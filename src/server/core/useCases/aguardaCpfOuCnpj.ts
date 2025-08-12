import { ResultAction } from "../../interfaces/ResultAction";
import { StoredStep } from "../../interfaces/StoredStep";
import XcallyApiService from "../../services/XcallyApiService";
import { cnpjValido } from "../../utils/cnpjValido";
import { cpfValido } from "../../utils/cpfValido";
import Session from "../Session";

export const aguardaCpfOuCnpj = async (session: Session, nextStep: string): Promise<StoredStep | undefined> => {

    const msg = session.parsedData.messageFromClient;

    if (!cpfValido(msg) || !cnpjValido(msg)) {

        await XcallyApiService.SendMessage('aguardaCpfOuCnpj', session, `Desculpa, mas o dado informado está 
invalido.  Vamos tentar novamente?

Informe o CPF ou o CNPJ, apenas números,  
para que eu possa consultar seus boletos...`);

        session.sessionDb.countAnswerError++;
        await session.sessionDb.save();

        if (session.sessionDb.countAnswerError > 2) {
            session.closeInteractionAndRemoveSession('EXCESSO TENTATIVAS', 'Esta interação será encerrada por exesso de tentativas!');
        } else {
            await XcallyApiService.SendMessage("flow - aguardandoResposta", session, "Resposta inválida!");
        }

    }

    // await session.updateDadosDatabase({ cpf: msg });
    // await session.updateDadosDatabase({ cnpj: msg });













    return undefined;

}
