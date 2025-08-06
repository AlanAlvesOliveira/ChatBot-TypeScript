
import ParsedData from "../interfaces/ParsedData";

import { getConfiguration } from "../utils/loadConfiguration"
import SessionManager from "../services/SessionManager";
import XcallyApiService from "../services/XcallyApiService";
import delay from "../utils/delay";
import { StoredStep } from "../interfaces/StoredStep";
import { Interaction } from "../models/InteractionSession";
import steps from "./flows/flow_v1"
import { where } from "sequelize";
import { osIp } from "../utils/osIp";

export default class Session {

    private interactionIdBd: number;
    private parsedData: ParsedData;

    private SESSION_TIMEOUT_DURATION: number;
    private TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS: number;
    private sessionTimeout: NodeJS.Timeout | null = null;
    private sessionAlertTimeout: NodeJS.Timeout | null = null;
    public salvarEmMemoria = false;

    private constructor(data: ParsedData, interactionIdBd: number, ipServidor: string) {

        this.interactionIdBd = interactionIdBd;
        this.parsedData = data;

        this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS = getConfiguration().plugin.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS * 1000;
        this.SESSION_TIMEOUT_DURATION = getConfiguration().plugin.TIMEOUT_INTERACAO_EM_SEGUNDOS * 1000;
        if (this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS < this.SESSION_TIMEOUT_DURATION) {
            throw new Error("❌ TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS < SESSION_TIMEOUT_DURATION ")
        }

        if (ipServidor === osIp()) {
            this.salvarEmMemoria = true;
            this.sessionAlertTimeout = setTimeout(async () => {
                await this.enviaAvisoTimeout();
            }, this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS);

            this.sessionTimeout = setTimeout(async () => {
                await this.encerraSessionPorTimeout();
            }, this.SESSION_TIMEOUT_DURATION);
        }
    }

    private async enviaAvisoTimeout() {
        let interactionFromBd = await Interaction.findByPk(this.interactionIdBd);
        if (
            interactionFromBd &&
            interactionFromBd?.sessionStatus !== "timeout" &&
            interactionFromBd?.sessionStatus !== "end" &&
            !interactionFromBd?.enviouAlertaFaltaInteracao
        ) {
            interactionFromBd.enviouAlertaFaltaInteracao = true;
            await interactionFromBd.save();
            await XcallyApiService.SendMessage(this, 'Alerta de falta de interação ');
            clearTimeout(this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS);
        }

    }

    private async encerraSessionPorTimeout() {
        let interactionFromBd = await Interaction.findByPk(this.interactionIdBd);

        if (
            interactionFromBd &&
            interactionFromBd?.sessionStatus !== "timeout" &&
            interactionFromBd?.sessionStatus !== "end" &&
            interactionFromBd?.enviouAlertaFaltaInteracao
        ) {
            await XcallyApiService.SendMessage(this, 'Conversa encerrada por falta de interação.');
            await delay(300); // Adiciona um pequeno delay antes de fechar a interação
            await XcallyApiService.CloseInteration(this);
            interactionFromBd.sessionStatus = "timeout";
            await interactionFromBd.save();
        }
        SessionManager.endSession(this);
    }


    public static async newSession(parsedData: ParsedData): Promise<Session> {

        const sessionExistenteBd = await Interaction.findOne({
            where: { composedSessionId: parsedData.composedSessionId }
        });

        if (sessionExistenteBd && sessionExistenteBd.ipServidor) {
            return new Session(parsedData, sessionExistenteBd.id, sessionExistenteBd.ipServidor);
        }

        let currentStep = steps.steps.find(x => x.stepId === '1')
            ?? (() => { throw new Error("❌ Nenhum passo inicial encontrado no fluxo!") })();

        try {
            const interactionIdBd = await Interaction.create({
                idInteraction: parsedData.interactionId,
                composedSessionId: parsedData.composedSessionId,
                accountId: parsedData.accountId,
                contactId: parsedData.contactId,
                tipoFila: "tipo fila",
                sessionStatus: currentStep.stepId,
                statusAntigo: "",
                messageId: "",
                ipServidor: osIp(),
                createdAt: new Date(),
                lastInteractionDate: new Date(),
                //id: "", auto gerado pelo bd
                enviouAlertaFaltaInteracao: false,
                countAnswerError: 0,
                channelOrigem: "",
                citsmart: "{}",
                beneficiario: "{}",
            });


            console.log(`Interaction interactionIdBd: ${interactionIdBd.id}, composedSessionId: ${parsedData.composedSessionId} criada com sucesso!`);
            return new Session(parsedData, interactionIdBd.id, osIp());
        } catch (error) {
            console.log(`Erro ao criar Interaction no bd `, parsedData);

            throw error;
        }
    }

    public updateData(data: ParsedData) {
        this.parsedData = data;
    }

    public async resetTimeout(): Promise<void> {

        // Limpa o timeout anterior, se existir
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
        if (this.sessionAlertTimeout) {
            clearTimeout(this.sessionAlertTimeout);
            this.sessionAlertTimeout = null;
        }

        // Busca o tempo da última interação no banco de dados
        let interactionFromBd = await Interaction.findByPk(this.parsedData.interactionId);

        if (!interactionFromBd) throw new Error('session não encontrada no bd');

        if (interactionFromBd.ipServidor !== osIp()) {
            //não faz nada pois já está sendo gerida por outro app
            return;
        }

        this.sessionAlertTimeout = setTimeout(async () => {
            await this.enviaAvisoTimeout();
        }, this.TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS);

        this.sessionTimeout = setTimeout(async () => {
            await this.encerraSessionPorTimeout();
        }, this.SESSION_TIMEOUT_DURATION);
    }

    public getSessionData(): ParsedData {
        return this.parsedData;
    }

    public async close() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        if (this.sessionAlertTimeout) clearTimeout(this.sessionAlertTimeout);

        let interactionFromBd = await Interaction.findByPk(this.interactionIdBd);

        if (interactionFromBd) {
            await XcallyApiService.SendMessage(this, 'Conversa encerrada.');
            await delay(300); // Adiciona um pequeno delay antes de fechar a interação
            await XcallyApiService.CloseInteration(this);
            interactionFromBd.sessionStatus = "end";
            await interactionFromBd.save();
        }
    }

    public async getCurrentStep(): Promise<StoredStep> {
        let interactionFromBd = await Interaction.findByPk(this.interactionIdBd);

        if (interactionFromBd) {
            return steps.steps.find(x => x.stepId === interactionFromBd.sessionStatus)
                ?? (() => { throw new Error("❌ Nenhum passo inicial encontrado no fluxo!") })();
        } else {
            console.log('[ERRO] Step não encontrado!');
            throw new Error('[ERRO] Step não encontrado!');
        }
    }

    public async addCountErrorAndTest(tentativas: number): Promise<boolean> {

        let interactionFromBd = await Interaction.findByPk(this.interactionIdBd);
        let maximoTentativasAtingido = false;
        if (interactionFromBd) {
            if (interactionFromBd.countAnswerError > tentativas) {
                maximoTentativasAtingido = true

                this.close();
                await XcallyApiService.SendMessage(this, 'Conversa encerrada, por exceder máximo de tentativas.');
                await delay(300); // Adiciona um pequeno delay antes de fechar a interação
                await XcallyApiService.CloseInteration(this);
                interactionFromBd.sessionStatus == "Máximo de Tentativas Atingido.";
            } else {
                interactionFromBd.countAnswerError++;
            }
        }
        return maximoTentativasAtingido;
    }




}
