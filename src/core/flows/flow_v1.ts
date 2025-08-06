import { Flow } from "../../interfaces/Flow";


const flow: Flow = {
    idFlow: '1',
    nome: 'flowHuskvarna',
    steps: [
        {
            stepId: '1',
            respostasValidas: undefined,
            actions: [
                {
                    type: 'sendMessage',
                    params: ['Bem vindo, como posso ajudar?']
                }
            ]
        },
        {
            stepId: '2',
            respostasValidas: undefined,
            actions: [
                {
                    type: 'sendMessage',
                    params: ['Menu de opções 2']
                }
            ]
        }
    ],
    dataCriacao: new Date(),
    ativo: true
}


export default flow;