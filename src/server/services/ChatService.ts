import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";
import XcallyApiService from "./XcallyApiService";

export default class ChatService {
    static async flow(data: ParsedData): Promise<void> {

        const session = await SessionManager.createOrGetSession(data);
        await session.startResetTimeout();

        let currentStep = await session.getCurrentStep();

        if (session.sessionDb.aguardandoResposta) {

            console.log(`Executando ${session.interactionIdBd} aguardando Resposta no flow`);

            if (!currentStep.respostasValidas) throw new Error('Esperando resposta, porém não foi localizada no fluxo resposta válidas');

            const respostaUser = session.getSessionData().messageFromClient?.trim();

            const achouResposta = currentStep.respostasValidas.find(item => item.respostaValue === respostaUser);

            if (achouResposta) {

                session.sessionDb.statusAntigo = session.sessionDb.sessionStatus;
                session.sessionDb.sessionStatus = achouResposta.nextStepId;
                session.sessionDb.aguardandoResposta = false;
                await session.sessionDb.save();

                currentStep = await session.getCurrentStep();

            } else {

                session.sessionDb.countAnswerError++;
                await session.sessionDb.save();

                if (session.sessionDb.countAnswerError > 3) {
                    session.close('EXCESSO TENTATIVAS', 'Esta interação será encerrada por exesso de tentativas!');
                } else {
                    await XcallyApiService.SendMessage(session, "Resposta inválida!");
                }
            }
        }


        if (!session.sessionDb.aguardandoResposta) {
            for (const action of currentStep.actions) {

                console.log(`Executando interactionIdBd: ${session.interactionIdBd} stepId: ${currentStep.stepId} action:${action.type}  `)

                try {
                    // Verificação de tipo segura
                    const handler = actionRegistry[action.type];
                    if (handler) {

                        await handler(session, action.params);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        console.error(`Tipo de ação não suportado: ${action.type}`);
                    }
                } catch (error) {
                    console.error(`Erro ao executar ação ${action.type}:`, error);
                }
            }
        }
    }
}