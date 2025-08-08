import { Flow } from "../../interfaces/Flow";


const flow: Flow = {
    idFlow: '1',
    nome: 'flow_documento',
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
                { type: 'aguardaResposta', params: [] }
            ]
        },
        {
            stepId: '1_1',
            respostasValidas: [
                { respostaValue: "1", nextStepId: "1_1_1" },
                { respostaValue: "2", nextStepId: "1_1_2" }
            ],
            actions: [
                {
                    type: 'enviaMensagem', params: [`Ecommerce digite 1
Pós vendas e suporte digite 2`]
                },
                { type: 'aguardaResposta', params: [] }
            ]
        },
        {
            stepId: '1_1_1',
            respostasValidas: [
                { respostaValue: "1", nextStepId: "1_1_1_1" },
                { respostaValue: "2", nextStepId: "1_1_1_2" },
                { respostaValue: "3", nextStepId: "1_1_1_3" },
                { respostaValue: "4", nextStepId: "1_1_1_4" },
                { respostaValue: "5", nextStepId: "1_1_1_5" },
            ],
            actions: [
                {
                    type: 'enviaMensagem', params: [`Duvida de pedido digite 1
 Status de entrega digite 2
 Agendamento de entrega técnica digite 3
 Troca e Devolução digite 4
 Outros assuntos digite 5`]
                },
                { type: 'aguardaResposta', params: [] }
            ]
        }

    ],
    dataCriacao: new Date(),
    ativo: true
}


export default flow;