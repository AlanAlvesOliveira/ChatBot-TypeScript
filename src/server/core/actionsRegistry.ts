
import XcallyApiService from "../services/XcallyApiService";
import Session from "./Session";
import { ResultAction } from '../interfaces/ResultAction';
import { ActionDefinition } from "../interfaces/ActionDefinition";
import { validaRespotaUsuario } from "./useCases/validaResposta";
import { aguardaCpfOuCnpj } from "./useCases/aguardaCpfOuCnpj";




type ActionHandler = (session: Session, params: ActionDefinition | undefined) => Promise<ResultAction>;


interface ActionRegistry {
    [key: string]: ActionHandler
}

const actionRegistry: ActionRegistry = {
    "enviaMensagem": async (session, args) => {
        if (args?.type !== 'enviaMensagem') throw new Error('actionRegistry -> enviaMensagem');
        return await XcallyApiService.SendMessage("enviaMensagem", session, args?.params.conteudo);
    },
    "aguardaResposta": async (session, args) => {
        if (args?.type !== 'aguardaResposta') throw new Error('actionRegistry -> aguardaResposta');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const nextStep = await validaRespotaUsuario(session, args);
            return { success: true, nextStep }
        }
    },
    "encerrarInteracao": async (session, args) => {
        if (args?.type !== 'encerrarInteracao') throw new Error('actionRegistry -> encerrarInteracao');
        return session.closeInteractionAndRemoveSession('end', "Obrigado por entrar em contato. Este atendimento foi encerrado.");
    },
    "encaminharFila": async (session, args) => {
        if (args?.type !== 'encaminharFila') throw new Error('actionRegistry -> encaminharFila');
        return await session.encaminhaFila(args.params.nomeFila);
    },
    "aguardaCpfOuCnpj": async (session, args) => {

        if (args?.type !== 'aguardaCpfOuCnpj') throw new Error('actionRegistry -> aguardaCpfOuCnpj');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const nextStep = await aguardaCpfOuCnpj(session, args.params.nextStep);
            return { success: true, nextStep }
        }
    },
};

export default actionRegistry;
