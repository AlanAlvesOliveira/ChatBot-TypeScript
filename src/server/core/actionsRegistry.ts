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
};

export default actionRegistry;