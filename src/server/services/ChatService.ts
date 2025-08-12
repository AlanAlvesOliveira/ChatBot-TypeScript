import { aguardaCpfOuCnpj } from './../core/useCases/aguardaCpfOuCnpj';
import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";
import { validaRespotaUsuario } from "../core/useCases/validaResposta";

export default class ChatService {
    static async flow(data: ParsedData): Promise<string> {

        const session = await SessionManager.createOrGetSession(data);
        await session.startResetTimeout();

        let currentStep = await session.getCurrentStep();

        if (session.sessionDb.aguardandoResposta) {



            console.log(`-> Esperando resposta interactionIdBd: ${session.interactionIdBd} stepId: ${currentStep.stepId}`);



            const aguardaRespostaAction = currentStep.actions.find(x => x.type === 'aguardaResposta');
            if (aguardaRespostaAction) {
                const newStep = await validaRespotaUsuario(session, aguardaRespostaAction);
                if (!newStep) {
                    console.log('não foi possível localizar um novo step em aguardaRespostaAction');
                } else {
                    currentStep = newStep;
                }

            }

            const aguardaCpfOuCnpjAction = currentStep.actions.find(x => x.type === 'aguardaCpfOuCnpj');
            if (aguardaCpfOuCnpjAction) {
                const newStep = await aguardaCpfOuCnpj(session, aguardaCpfOuCnpjAction.params.nextStep);
                if (!newStep) {
                    console.log('não foi possível localizar um novo step em aguardaRespostaAction');
                } else {
                    currentStep = newStep;
                }
            }

            //const achouResposta = respostasValidas.find(item => item.respostaValue === respostaUser);

        }


        if (!session.sessionDb.aguardandoResposta) {
            for (const action of currentStep.actions) {

                try {
                    const actionHandler = actionRegistry[action.type];
                    if (actionHandler) {
                        const result = await actionHandler(session, action);
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