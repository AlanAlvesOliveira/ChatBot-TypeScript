
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
};



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