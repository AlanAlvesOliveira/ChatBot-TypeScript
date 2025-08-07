import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";



export default class ChatService {
    static async flow(data: ParsedData): Promise<void> {

        const session = await SessionManager.createOrGetSession(data);
        await session.startResetTimeout();
        console.log('ChatService -> ', data);
        const currentStep = await session.getCurrentStep();

        if (currentStep?.actions) {
            for (const action of currentStep.actions) {


                console.log(`Executando ${session.interactionIdBd} action:${action.type}  `)

                try {
                    // Verificação de tipo segura
                    const handler = actionRegistry[action.type];
                    if (handler) {
                        await handler(session, action.params);
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