import InterationsRepository from "../database/InterationsRepository";
import ParsedData from "../interfaces/ParsedData";
import Step from "../interfaces/Step";
import steps from "./flow/main";
import { getConfiguration } from "../utils/loadConfiguration"
import SessionManager from "../services/SessionManager";
import XcallyApiService from "../services/XcallyApiService";
import delay from "../utils/delay";


export default class Session {
    private sessionTimeout: NodeJS.Timeout | null = null;
    private data: ParsedData;
    private currentStep: Step;
    private qtdErros: number = 0;
    private SESSION_TIMEOUT_DURATION: number;
    public ultimoIdMessage?: number;

    constructor(data: ParsedData) {
        this.data = data;
        this.currentStep = steps.find(step => step.id === 1)
            ?? (() => { throw new Error("❌ Nenhum passo inicial encontrado no fluxo!") })();
        this.SESSION_TIMEOUT_DURATION = getConfiguration().plugin.TIMEOUT_INTERACAO_EM_SEGUNDOS * 1000;
    }

    public updateData(data: ParsedData) {
        this.data = data;
    }

    public async resetTimeout() {

        // Limpa o timeout anterior, se existir
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null; // Reseta a referência do timeout
        }

        // Busca o tempo da última interação no banco de dados
        let interactionFromBd = await InterationsRepository.getExternalUrl(Number(this.data.interactionId));
        const lastInteractionTime = interactionFromBd?.dataUltimaInteracao ? new Date(interactionFromBd.dataUltimaInteracao).getTime() : null;

        const now = Date.now();
        const timeSinceLastInteraction = lastInteractionTime ? now - lastInteractionTime : null;


        // Se o tempo desde a última interação for menor que o timeout, recalcula o tempo restante
        const timeoutDuration = timeSinceLastInteraction && timeSinceLastInteraction < this.SESSION_TIMEOUT_DURATION
            ? this.SESSION_TIMEOUT_DURATION - timeSinceLastInteraction
            : this.SESSION_TIMEOUT_DURATION;


        // Configura o novo timeout
        this.sessionTimeout = setTimeout(async () => {

            interactionFromBd = await InterationsRepository.getExternalUrl(Number(this.data.interactionId));

            //veririca se no banco já foi atualizado antes de mandar mensagem de timout
            if (interactionFromBd.timeout === false && interactionFromBd.qtdErros <= 3 && interactionFromBd.step !== 0) {

                await XcallyApiService.SendMessage(this, 'Conversa encerrada por falta de interação.');
                await delay(300); // Adiciona um pequeno delay antes de fechar a interação
                await XcallyApiService.CloseInteration(this);
                await InterationsRepository.updateExternalUrl(this.data.interactionId, { "timeout": true });
            }
            SessionManager.endSession(this);

        }, timeoutDuration);
    }

    public getSessionData(): ParsedData {

        return this.data;
    }

    public close() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        return this.data;
    }

    public async addCountError(): Promise<void> {

        const result = await InterationsRepository.getExternalUrl(Number(this.data.interactionId));

        this.qtdErros = result.qtdErros + 1;

        await InterationsRepository.updateExternalUrl(this.data.interactionId, { qtdErros: this.qtdErros });
    }

    public async getQtdErrors(): Promise<number> {
        const result = await InterationsRepository.getExternalUrl(Number(this.data.interactionId));

        if (!result || result.qtdErros === undefined) {
            console.log('Não achei qtdErros em getQtdErrors');
            throw new Error('Não achei qtdErros em getQtdErrors');
        }

        this.qtdErros = result.qtdErros;
        return this.qtdErros;
    }

    public async resetErros(): Promise<void> {
        this.qtdErros = 0;
        await InterationsRepository.updateExternalUrl(this.data.interactionId, { qtdErros: 0 });
    }

    public async setCurrentStep(step: Step) {

        await InterationsRepository.updateExternalUrl(this.data.interactionId, { step: step.id });

        this.currentStep = step;
    }

    public async getCurrentStep(): Promise<Step> {
        const result = await InterationsRepository.getExternalUrl(Number(this.data.interactionId));

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
