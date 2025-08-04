import { Request } from "express";
import ParsedData from "../interfaces/ParsedData";
import parsedDataHandle from "../utils/parsedDataFromXcallyHandle";
import SessionManager from "../services/SessionManager";
import steps from "../core/flow/main";
import XcallyApiService from "./XcallyApiService";
import encerraInteration from "../domain/useCases/encerraInteration";

export default class ChatService {
    static async flow(data: ParsedData): Promise<void> {


        // Obtém ou cria uma sessão
        const sessionData = SessionManager.createOrGetSession(data);
        await sessionData.resetTimeout();

        let currentStep = await sessionData.getCurrentStep();

        if (currentStep?.actions) {
            for (const action of currentStep.actions) {
                try {
                    const resultAction = await action(sessionData);

                    if (!resultAction.continuarFluxo) {
                        console.log('fluxo interrompido', action.name);
                        return;
                    }

                    if (resultAction.nextStep) {
                        currentStep = resultAction.nextStep
                    }

                } catch (error) {
                    console.error("Erro ao executar ação:", error);
                }
            }
        }

        if (currentStep.id === 0) {
            await encerraInteration(sessionData, 'Agradecemos sua Participação.')
            console.log('encerrar');
            return;
        }

        if (currentStep?.mensagens) {

            for (const mensagem of currentStep.mensagens) {
                try {
                    await XcallyApiService.SendMessage(sessionData, mensagem)
                } catch (error) {
                    console.error("Erro ao executar mandar mensagem:", error);
                }
                await new Promise((resolve) => { setTimeout(resolve, 500); });
            }
        }

        console.log('fluxo até o final');
        return;
    }
}
