
import ParsedData from "../interfaces/ParsedData";

import { getConfiguration } from "../utils/loadConfiguration"
import SessionManager from "../services/SessionManager";
import XcallyApiService from "../services/XcallyApiService";
import delay from "../utils/delay";
import { StoredStep } from "../interfaces/StoredStep";
import { Interaction } from "../models/InteractionSession";
import steps from "../core/flows/flow_v1"


export default class Session {

    private parsedData?: ParsedData;
    private sessionId?: string
    private currentStep?: StoredStep;
    private qtdErros: number = 0;

    private SESSION_TIMEOUT_DURATION?: number;
    private TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS?: number;
    private sessionTimeout: NodeJS.Timeout | null = null;
    private sessionAlertTimetout: NodeJS.Timeout | null = null;


    public async newSession(data: ParsedData) {

        this.sessionId = data.composedSessionId
        this.parsedData = data;

        this.currentStep = steps.steps.find(x => x.stepId === '1')
            ?? (() => { throw new Error("❌ Nenhum passo inicial encontrado no fluxo!") })();

        this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS = getConfiguration().plugin.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS * 1000;
        this.SESSION_TIMEOUT_DURATION = getConfiguration().plugin.TIMEOUT_INTERACAO_EM_SEGUNDOS * 1000;

        if (this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS < this.SESSION_TIMEOUT_DURATION) {
            throw new Error("❌ TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS < SESSION_TIMEOUT_DURATION ")
        }

        try {
            const campanha = await Interaction.create({
                idInteraction: this.parsedData.interactionId,
                composedSessionId: this.parsedData.composedSessionId,
                accountId: this.parsedData.accountId,
                contactId: this.parsedData.contactId,
                tipoFila: "tipo fila",
                sessionStatus: this.currentStep.stepId,
                statusAntigo: "",
                messageId: "",
                ipServidor: "",
                createdAt: new Date(),
                lastInteractionDate: new Date(),
                //id: "", auto gerado pelo bd
                enviouAlertaFaltaInteracao: false,
                countAnswerError: 0,
                channelOrigem: "",
                citsmart: "{}",
                beneficiario: "{}",
            });

            console.log(`Interaction ${campanha.id} criada com sucesso!`);
        } catch (error) {
            console.log(`Erro ao criar Interaction no bd `, this.parsedData);

            throw error;
        }


    }

    public updateData(data: ParsedData) {
        this.parsedData = data;
    }

    public async resetTimeout() {

        // Limpa o timeout anterior, se existir
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null; // Reseta a referência do timeout
        }

        // Busca o tempo da última interação no banco de dados
        let interactionFromBd = await Interaction.findByPk(this.parsedData.interactionId);
        if (!interactionFromBd) throw new Error('session não encontrada no bd');

        const lastInteractionTime = interactionFromBd?.lastInteractionDate ? new Date(interactionFromBd?.lastInteractionDate).getTime() : null;

        const now = Date.now();
        const timeSinceLastInteraction = lastInteractionTime ? now - lastInteractionTime : null;

        // Se o tempo desde a última interação for menor que o timeout, recalcula o tempo restante
        const timeoutDuration = timeSinceLastInteraction && timeSinceLastInteraction < this.SESSION_TIMEOUT_DURATION
            ? this.SESSION_TIMEOUT_DURATION - timeSinceLastInteraction
            : this.SESSION_TIMEOUT_DURATION;


        // Configura o novo timeout
        this.sessionTimeout = setTimeout(async () => {


            interactionFromBd = await Interaction.findByPk(this.parsedData.interactionId)

            //veririca se no banco já foi atualizado antes de mandar mensagem de timout
            //if (interactionFromBd.timeout === false && interactionFromBd.qtdErros <= 3 && interactionFromBd.step !== 0) {
            if (interactionFromBd?.sessionStatus !== "timeout") {


                await XcallyApiService.SendMessage(this, 'Conversa encerrada por falta de interação.');
                await delay(300); // Adiciona um pequeno delay antes de fechar a interação
                await XcallyApiService.CloseInteration(this);
                interactionFromBd?.sessionStatus == "timeout";

                //interactionFromBdawait InterationsRepository.updateExternalUrl(this.parsedData.interactionId, { "timeout": true });
            }
            SessionManager.endSession(this);

        }, timeoutDuration);
    }

    public getSessionData(): ParsedData {

        return this.parsedData;
    }

    public close() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        if (this.sessionAlertTimetout) clearTimeout(this.sessionAlertTimetout);
        return this.parsedData;
    }

    public async addCountError(): Promise<void> {

        //const result = await InterationsRepository.getExternalUrl(Number(this.parsedData.interactionId));





        this.qtdErros = result.qtdErros + 1;

        await InterationsRepository.updateExternalUrl(this.parsedData.interactionId, { qtdErros: this.qtdErros });
    }

    public async getQtdErrors(): Promise<number> {
        const result = await InterationsRepository.getExternalUrl(Number(this.parsedData.interactionId));

        if (!result || result.qtdErros === undefined) {
            console.log('Não achei qtdErros em getQtdErrors');
            throw new Error('Não achei qtdErros em getQtdErrors');
        }

        this.qtdErros = result.qtdErros;
        return this.qtdErros;
    }

    public async resetErros(): Promise<void> {
        this.qtdErros = 0;
        await InterationsRepository.updateExternalUrl(this.parsedData.interactionId, { qtdErros: 0 });
    }

    public async setCurrentStep(step: Step) {

        await InterationsRepository.updateExternalUrl(this.parsedData.interactionId, { step: step.id });

        this.currentStep = step;
    }

    public async getCurrentStep(): Promise<Step> {

        const result = await InterationsRepository.getExternalUrl(Number(this.parsedData.interactionId));

        // Verifica se result é válido e tem um step
        if (!result || result.step == null) {
            console.log('Não achei em getCurrentStep');
            throw new Error('Não achei em getCurrentStep');
        }

        this.currentStep = steps.find(step => step.id === Number(result.step))
            ?? (() => { throw new Error("❌ Nenhum passo inicial encontrado no fluxo em getCurrentStep!") })();

        return this.currentStep;
    }

}
