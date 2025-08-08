import { Result } from './../../../node_modules/rimraf/node_modules/glob/dist/commonjs/walker.d';
import XcallyApiService from "../services/XcallyApiService";
import Session from "./Session";
import { ResultAction } from '../interfaces/ResultAction';


type ActionHandler = (session: Session, params?: any) => Promise<ResultAction>;


interface ActionRegistry {
    [key: string]: ActionHandler
}

const actionRegistry: ActionRegistry = {
    "enviaMensagem": async (session, args) => {
        return await XcallyApiService.SendMessage("enviaMensagem", session, args[0]);
    },
    "atualizaStatusStep": async (session, args) => {
        return await session.updateStatusInBd(args[0])
    },
    "aguardaResposta": async (session, args) => {
        return await session.updateAguardandoResposta(true);
    },
    "encerrarInteracao": async (session, args) => {
        return session.closeInteractionAndRemoveSession('end', "Obrigado por entrar em contato. Este atendimento foi encerrado.");
    },
    "encaminharFila": async (session, args) => {
        return await session.encaminhaFila(args[0]);
    },
};

export default actionRegistry;
