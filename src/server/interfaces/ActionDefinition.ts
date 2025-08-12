
export type ActionDefinition = {
    type: 'enviaMensagem';
    params: MensagemParams;
} | {
    type: 'aguardaResposta';
    params: RespostaParams;
} | {
    type: 'aguardaCpfOuCnpj';
    params: Cpf;
} | {
    type: 'encerrarInteracao';
    params: undefined;
} | {
    type: 'encaminharFila';
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