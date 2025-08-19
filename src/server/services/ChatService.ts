import { getConfiguration } from './../utils/loadConfiguration';
import { aguardaCpfOuCnpj } from './../core/useCases/aguardaCpfOuCnpj';
import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";
import { validaRespotaUsuario as validaRespostaUsuario } from "../core/useCases/validaResposta";
import XcallyApiService from './XcallyApiService';
import { VerificaExcessoInteracoes } from './VerificaExcessoInteracoes';

export default class ChatService {
    static async flow(data: ParsedData): Promise<string> {

        const excessoDeInteracoes = await VerificaExcessoInteracoes(data.contactId);
        //não está filtrando corretamente
        console.log('excessoDeInteracoes -> ', excessoDeInteracoes)

        if (excessoDeInteracoes && excessoDeInteracoes.maximoAtingido) {
            console.log(`[WARNING] Excesso de interações detectado para ${excessoDeInteracoes}`,);
            return 'end';
        }

        const session = await SessionManager.createOrGetSession(data);
        await session.startResetTimeout();

        let currentStep = await session.getCurrentStep();

        if (session.sessionDb.aguardandoResposta) {


            const actionsComResposta = currentStep.actions.filter(x => x.aguardaResposta);
            if (actionsComResposta.length > 1) throw new Error(`Encontrei mais de uma ação esperando resposta no step ${currentStep.stepId}`);


            const action = actionsComResposta[0];

            const actionHandler = actionRegistry[action.type];
            const result = await actionHandler(session, action);
            if (result.success && result.nextStep) {
                currentStep = result.nextStep;
            }

            // const aguardaCpfOuCnpjAction = currentStep.actions.find(x => x.type === 'aguardaCpfOuCnpj');
            // if (aguardaCpfOuCnpjAction) {
            //     console.log(`-> Esperando (aguardaCpfOuCnpjAction) resposta interactionIdBd: ${session.interactionIdBd} stepId: ${currentStep.stepId}`);

            //     const newStep = await aguardaCpfOuCnpj(session, aguardaCpfOuCnpjAction.params.nextStep);
            //     if (!newStep) {
            //         console.log('não foi possível localizar um novo step em aguardaRespostaAction');
            //     } else {
            //         currentStep = newStep;
            //     }
            // } else {
            //     const aguardaRespostaAction = currentStep.actions.find(x => x.type === 'aguardaResposta');

            //     if (aguardaRespostaAction) {
            //         console.log(`-> Esperando (aguardaRespostaAction) resposta interactionIdBd: ${session.interactionIdBd} stepId: ${currentStep.stepId}`);

            //         const newStep = await validaRespostaUsuario(session, aguardaRespostaAction);
            //         if (!newStep) {
            //             console.log('não foi possível localizar um novo step em aguardaRespostaAction');
            //         } else {
            //             currentStep = newStep;
            //         }
            //     }
            // }
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