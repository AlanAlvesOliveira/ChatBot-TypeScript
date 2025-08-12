
export type ActionDefinition = {
    type: 'enviaMensagem';
    params: [MensagemParams];  // Tuple com exatamente 1 elemento
} | {
    type: 'aguardaResposta';
    params: [RespostaParams];  // Tuple com exatamente 1 elemento
} | {
    type: 'aguardaCpfOuCnpj';
    params: [Cpf];
} | {
    type: 'encerrarInteracao';
    params: []
} | {
    type: 'encaminharFila';
    params: [encaminharFila]
};


interface encaminharFila {
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