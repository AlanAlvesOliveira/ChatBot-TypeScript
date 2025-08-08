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
        await session.updateStatusInBd(args[0])
    },
    "aguardaResposta": async (session, args) => {
        session.sessionDb.aguardandoResposta = true;
        await session.sessionDb.save();
    },
    "encerrarInteracao": async (session, args) => {
        session.close('end', "Obrigado por entrar em contato. Este atendimento foi encerrado.");
    },
    "encaminharFila": async (session, args) => {
        session.clearTimeoutsAndRemoveFromMemory();
        await session.updateStatusInBd(args[0])
        await XcallyApiService.SendMessage(session, "Encaminhando para Fila pelo bot", true);
    },
};

export default actionRegistry;
