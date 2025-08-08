import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";
import XcallyApiService from "./XcallyApiService";

export default class ChatService {
    static async flow(data: ParsedData): Promise<string> {

        const session = await SessionManager.createOrGetSession(data);
        await session.startResetTimeout();

        let currentStep = await session.getCurrentStep();

        if (session.sessionDb.aguardandoResposta) {

            console.log(`-> Esperando resposta interactionIdBd: ${session.interactionIdBd} stepId: ${currentStep.stepId}`);

            if (!currentStep.respostasValidas) throw new Error('Esperando resposta, porém não foi localizada no fluxo resposta válidas');

            const respostaUser = session.getSessionData().messageFromClient?.trim();
            const achouResposta = currentStep.respostasValidas.find(item => item.respostaValue === respostaUser);

            if (achouResposta) {
                session.sessionDb.statusAntigo = session.sessionDb.sessionStatus;
                session.sessionDb.sessionStatus = achouResposta.nextStepId;
                session.sessionDb.aguardandoResposta = false;
                await session.sessionDb.save();
                //atualiza o step
                currentStep = await session.getCurrentStep();
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



        if (!session.sessionDb.aguardandoResposta) {
            for (const action of currentStep.actions) {

                try {
                    const actionHandler = actionRegistry[action.type];
                    if (actionHandler) {
                        const result = await actionHandler(session, action.params);
                        console.log(`-> Action {interactionIdBd:${session.interactionIdBd}} {composedSessionId:${session.parsedData.composedSessionId}} {stepId:${currentStep.stepId}} {action:${action.type}} sucesso: ${JSON.stringify(result)}}'} `)
                        let timeout = action.type === 'enviaMensagem' ? 1000 : 500;
                        await new Promise(resolve => setTimeout(resolve, timeout));
                    } else {
                        console.error(`Tipo de ação não suportado: ${action.type}`);
                    }
                } catch (error) {
                    console.error(`Erro ao executar ação ${action.type}:`, error);
                }

            }
        }

        console.log('%%%%%%%%% ', session.sessionDb.sessionStatus);

        return session.sessionDb.sessionStatus;
    }
}