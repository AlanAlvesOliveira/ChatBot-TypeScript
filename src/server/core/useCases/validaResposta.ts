import { StoredStep } from "../../interfaces/StoredStep";
import XcallyApiService from "../../services/XcallyApiService";
import Session from "../Session";

export const validaRespotaUsuario = async (session: Session, currentStep: Array<{ respostaValue: string; nextStepId: string; }>): Promise<StoredStep | undefined> => {

    const respostaUser = session.getSessionData().messageFromClient?.trim();
    const achouResposta = currentStep.find(x => x.respostaValue === respostaUser);

    if (achouResposta) {
        session.sessionDb.statusAntigo = session.sessionDb.sessionStatus;
        session.sessionDb.sessionStatus = achouResposta.nextStepId;
        session.sessionDb.aguardandoResposta = false;
        session.sessionDb.countAnswerError = 0;
        await session.sessionDb.save();
        //atualiza o step
        return await session.getCurrentStep();
    } else {

        session.sessionDb.countAnswerError++;
        await session.sessionDb.save();

        if (session.sessionDb.countAnswerError > 3) {
            session.closeInteractionAndRemoveSession('EXCESSO TENTATIVAS', 'Esta interação será encerrada por exesso de tentativas!');
        } else {
            await XcallyApiService.SendMessage("flow - aguardandoResposta", session, "Resposta inválida!");
        }
    }

}