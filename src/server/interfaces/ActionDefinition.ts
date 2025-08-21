import { aguardaCpfOuCnpj } from './../core/useCases/aguardaCpfOuCnpj';
import { DataType } from 'sequelize-typescript';

export type ActionDefinition = {
    type: 'enviaMensagem';
    aguardaResposta: boolean;
    params: MensagemParams;
} | {
    type: 'aguardaResposta';
    aguardaResposta: boolean;
    params: RespostaParams;
} | {
    type: 'aguardaCpfOuCnpj';
    aguardaResposta: boolean;
    params: Cpf;
} | {
    type: 'encerrarInteracao';
    aguardaResposta: boolean;
    params: undefined;
} | {
    type: 'encaminharFila';
    aguardaResposta: boolean;
    params: EncaminharParams
} | {
    type: 'aguardarNumeroNotafiscal';
    aguardaResposta: boolean;
    params: undefined;
} | {
    type: 'aguardarFiltroDias';
    aguardaResposta: boolean;
    params: RespostaParams
} | {
    type: 'ListarBoletos';
    aguardaResposta: boolean;
    params: undefined
} | {
    type: 'BaixarBoleto';
    aguardaResposta: boolean;
    params: undefined
} | {
    type: 'aguardaRespostaDiasValidos';
    aguardaResposta: boolean;
    params: RespostaParams;
}


interface EncaminharParams {
    nomeFila: string;
}


interface RespostaParams {
    respostasValidas: Array<{
        respostaValue: string;
        nextStepId: string;
    }>;
}

interface MensagemParams {
    conteudo: string;
}

interface Cpf {
    nextStep: string;
}