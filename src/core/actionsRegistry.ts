// src/core/actionsRegistry.ts
import XcallyApiService from "../services/XcallyApiService";
import Session from "./Session";



type ActionHandler = (session: Session, params?: any) => Promise<void>;

interface ActionRegistry {
    enviaMensagem: ActionHandler;
    // Adicione outras ações aqui com seus tipos específicos
}

const actionRegistry: ActionRegistry = {
    enviaMensagem: async (session, args) => {
        await XcallyApiService.SendMessage(session, args[0]);
    }
};

export default actionRegistry;