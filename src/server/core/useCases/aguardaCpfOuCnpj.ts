import { sequelize } from "../../database/config";
import { ResultAction } from "../../interfaces/ResultAction";
import { StoredStep } from "../../interfaces/StoredStep";
import XcallyApiService from "../../services/XcallyApiService";
import { cnpjValido } from "../../utils/cnpjValido";
import { cpfValido } from "../../utils/cpfValido";
import actionRegistry from "../actionsRegistry";
import Session from "../Session";

export const aguardaCpfOuCnpj = async (session: Session, nextStep: string): Promise<StoredStep | undefined> => {

    const msg = session.parsedData.messageFromClient;

    if (!cpfValido(msg) && !cnpjValido(msg)) {

        session.sessionDb.countAnswerError++;
        await session.sessionDb.save();

        if (session.sessionDb.countAnswerError > 2) {
            await XcallyApiService.SendMessage("flow - aguardaCpfOuCnpj", session, `Olha, como não consegui validar o CPF/CNPJ, estou te transferindo para um dos nossos colaboradores.`);
            await session.encaminhaFila('queue');
        } else {
            await XcallyApiService.SendMessage('aguardaCpfOuCnpj', session, `Desculpa, mas o dado informado está 
invalido.  Vamos tentar novamente?

Informe o CPF ou o CNPJ (somente números), apenas números,  
para que eu possa consultar seus boletos...`);
        }
        return;
    }

    session.sessionDb.countAnswerError = 0;
    await session.sessionDb.save();

    if (cpfValido(msg)) await session.updateDadosDatabase({ cpf: msg });
    if (cnpjValido(msg)) await session.updateDadosDatabase({ cnpj: msg });

    //buscar na pase
    const achouNaBase = true;

    if (!achouNaBase) {
        await XcallyApiService.SendMessage("flow - aguardaCpfOuCnpj", session, `Olha, esse CPF/CNPJ não consta na nossa base. Estou te transferindo para um colaborador para que ele te auxilie..`);
        await session.encaminhaFila('queue');
        return
    }

    await XcallyApiService.SendMessage("flow - aguardaCpfOuCnpj", session, `Certo! Só um instante enquanto eu busco no meu 
sistema ..`);

    const result = await session.updateStatusInBd('1_2_1_1_1_1');
    if (result.success) {
        return session.getCurrentStep();
    } else {
        console.log('não consegui achar no novo passo no aguarda cpf ou cnpj')
        return undefined;
    }




}
