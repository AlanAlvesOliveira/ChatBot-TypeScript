import { Flow } from "../../interfaces/Flow";


const flow: Flow = {
    idFlow: '1',
    nome: 'flowHuskvarna',
    steps: [
        {
            stepId: '1',
            respostasValidas: [
                { respostaValue: "1", nextStepId: "1_1" },
                { respostaValue: "2", nextStepId: "1_2" }
            ],
            actions: [
                { type: 'enviaMensagem', params: ["Bem-vindo ao serviço de atendimento ao Cliente Husqvarna"] },
                {
                    type: 'enviaMensagem', params: [`Para começarmos, digite uma das opções abaixo
Assuntos de consumidor digite 1
Assuntos de Revenda digite 2`]
                },
                { type: 'aguardaResposta', params: ['2'] }
            ]
        },
        {
            stepId: '1_1',
            respostasValidas: undefined,
            actions: [
                {
                    type: 'enviaMensagem', params: [`Ecommerce digite 1
Pós vendas e suporte digite 2`]
                }
            ]
        },
        {
            stepId: '1_2',
            respostasValidas: undefined,
            actions: [
                {
                    type: 'enviaMensagem', params: [`Financeiro digite 1
Pós vendas e suporte digite 2`]
                }
            ]
        }
    ],
    dataCriacao: new Date(),
    ativo: true
}


export default flow;