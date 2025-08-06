import { Request } from "express";
import ParsedData from "../interfaces/ParsedData";
import parsedDataHandle from "../utils/parsedDataFromXcallyHandle";
import SessionManager from "../services/SessionManager";

import XcallyApiService from "./XcallyApiService";


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

    }
}
