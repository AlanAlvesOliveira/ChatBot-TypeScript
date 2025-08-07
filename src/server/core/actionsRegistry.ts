import { where } from 'sequelize';
import { HttpStatusCode } from './../../../node_modules/axios/index.d';
// src/core/actionsRegistry.ts
import { Interaction } from "../models/InteractionSession";
import XcallyApiService from "../services/XcallyApiService";
import Session from "./Session";


// src/core/actionsRegistry.ts
type ActionHandler = (session: Session, params?: any) => Promise<void>;



interface ActionRegistry {
    [key: string]: ActionHandler
}

const actionRegistry: ActionRegistry = {
    "enviaMensagem": async (session, args) => {
        await XcallyApiService.SendMessage(session, args[0]);
    },
    "atualizaStatusStep": async (session, args) => {
        await Interaction.update(
            { sessionStatus: args[0] },
            { where: { id: session.interactionIdBd } }
        )
    },
    "aguardaResposta": async (session, args) => {

        const step = await session.getCurrentStep();
        console.log('step => ', step)

        if (step.respostasValidas && session.sessionDb.statusAntigo !== 'Curren Step') {
            session.sessionDb.statusAntigo = 'Curren Step';
            session.sessionDb.save();
        } else {

            const respostaUser = session.getSessionData().messageFromClient?.trim();
            if (step.respostasValidas) {

                const achado = step.respostasValidas.find(item => item.respostaValue === respostaUser);
                if (achado) {
                    console.log('achei resposta', achado);
                    session.sessionDb.sessionStatus = achado.nextStepId;
                    session.sessionDb.save();

                } else {
                    console.log('não achei resposta');
                    session.sessionDb.countAnswerError++;
                    session.sessionDb.save();
                }

            }

            session.sessionDb.statusAntigo = 'Curren Step';
            session.sessionDb.save();
        }
    },
};

export default actionRegistry;
