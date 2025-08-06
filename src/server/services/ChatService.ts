import ParsedData from "../interfaces/ParsedData";
import SessionManager from "./SessionManager";
import actionRegistry from "../core/actionsRegistry";


// Defina o tipo para as ações do fluxo
interface FlowAction {
    type: keyof typeof actionRegistry;
    params: any; // Ou use um tipo mais específico
}

export default class ChatService {
    static async flow(data: ParsedData): Promise<void> {
        const session = await SessionManager.createOrGetSession(data);
        const currentStep = await session.getCurrentStep();

        if (currentStep?.actions) {
            for (const action of currentStep.actions) {
                try {
                    // Verificação de tipo segura
                    const handler = actionRegistry[action.type as keyof typeof actionRegistry];
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