import { Flow } from "../../interfaces/Flow";


const flow: Flow = {
    idFlow: '1',
    nome: 'flow_documento',
    steps: [

        {
            stepId: '1', // 0
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        "conteudo": `*Bem-vindo a Husqvarna*

Digite a opção desejada:

1 - *Consumidor*
2 - *Revenda*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        "respostasValidas": [
                            { respostaValue: "1", nextStepId: "1_1" },
                            { respostaValue: "2", nextStepId: "1_2" }
                        ],
                    }
                }
            ]
        },
        {
            stepId: '1_1', // 10

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor*

Digite a opção desejada:

1 - *E-commerce*
2 - *Pós-Vendas e Suporte*

Digite *8* para *Retornar ao Menu Inicial* ou
Digite *9* para *Encerrar seu Atendimento*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_1_1" },
                            { respostaValue: "2", nextStepId: "1_1_2" },
                            { respostaValue: "8", nextStepId: "1" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_1', // 101

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/E-commerce*

Digite a opção desejada:

1 - *Dúvidas Sobre Pedido*
2 - *Status de Entrega*
3 - *Agendamento de Entrega Técnica*
4 - *Troca e Devoluções*
5 - *Outros Assuntos*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "queue" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "3", nextStepId: "queue" },
                            { respostaValue: "4", nextStepId: "1_1_1_1" },
                            { respostaValue: "5", nextStepId: "1_1_1_2" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_1_1', //1014

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/E-commerce/Trocas e Devoluções*

Em caso de trocas/devoluções consulte nossa política abaixo:

https://www.lojahusqvarna.com.br/Institucional/trocas-e-devolucoes

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        respostasValidas: [
                            { respostaValue: "1", nextStepId: "PESQUISA_1" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_1_2', //1015

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/E-commerce/Outros Assuntos*

Para demais assuntos, consultar nossa página de atendimento no link abaixo:

https://www.lojahusqvarna.com.br/institucional/atendimento

Se preferir, entre em contato conosco em nosso telefone 0800 022 9801 ou e-mail sac.brasil@husqvarnagroup.com

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        respostasValidas: [
                            { respostaValue: "1", nextStepId: "PESQUISA_1" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_2', // 102
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/Pós-Vendas e Suporte*

Digite a opção desejada:

1 - *Agendamento de Entrega Técnica*
2 - *Localizar Assistência Técnica ou Revenda Autorizada*
3 - *Garantia*
4 - *Suporte Técnico*
5 - *Outros Assuntos*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        respostasValidas: [
                            { respostaValue: "1", nextStepId: "queue" },
                            { respostaValue: "2", nextStepId: "1_1_2_1" },
                            { respostaValue: "3", nextStepId: "queue" },
                            { respostaValue: "4", nextStepId: "suporte" },
                            { respostaValue: "5", nextStepId: "1_1_2_2" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_2_1', //1022

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/Pós-Vendas e Suporte/Localizar Assistência Técnica ou Revenda Autorizada*

Para localizar uma Assistência Técnica ou Revenda autorizada Husqvarna, acesse o link abaixo e pesquise digitando a Rua, Bairro, Cidade ou Estado da sua preferência para visualizar as autorizadas na região:

https://www.husqvarna.com/br/revendedor/

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "PESQUISA_1" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_1_2_2', //1025

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Consumidor/E-commerce/Outros Assuntos*

Para demais assuntos, consultar nossa página de atendimento no link abaixo:

https://www.lojahusqvarna.com.br/institucional/atendimento

Se preferir, entre em contato conosco em nosso telefone 0800 022 9801 ou e-mail sac.brasil@husqvarnagroup.com

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "PESQUISA_1" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_2', //20

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Revenda*

Digite a opção desejada:

1 - *Financeiro*
2 - *Pós-Vendas e Suporte*

Digite *8* para *Retornar ao Menu Inicial* ou
Digite *9* para *Encerrar seu Atendimento*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_2_1" },
                            { respostaValue: "2", nextStepId: "1_2_2" },
                            { respostaValue: "8", nextStepId: "1" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_2_1', //201
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Revenda/Financeiro*

Digite a opção desejada:

1 - *Boletos*
2 - *Outros Assuntos*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_2_1_1" },
                            { respostaValue: "2", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_2_2', //202
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Revenda/Pós-Venda e Suporte*

Digite a opção desejada:

1 - *Garantia*
2 - *Suporte Técnico*
3 - *Informações Sobre Pedido de Compra*
4 - *Dúvidas*
5 - *Se Tornar Autorizada Husqvarna*
6 - *Outros Assuntos*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "queue" },
                            { respostaValue: "2", nextStepId: "suporte" },
                            { respostaValue: "3", nextStepId: "queue" },
                            { respostaValue: "4", nextStepId: "queue" },
                            { respostaValue: "5", nextStepId: "queue" },
                            { respostaValue: "6", nextStepId: "queue" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        //         {
        //             stepId: '1_2_1_1',
        //             respostasValidas: [
        //                 { respostaValue: "1", nextStepId: "PESQUISA_1" },
        //                 { respostaValue: "2", nextStepId: "queue" },
        //                 { respostaValue: "9", nextStepId: "end" },
        //             ],
        //             actions: [
        //                 {
        //                     type: 'enviaMensagem', params: [`Você escolheu a opção: *Revenda/Financeiro/Boletos*

        // Para baixar a 2ª via de boleto, acesse o link abaixo e insira o seu login e senha de Revenda. Em seguida, na parte de “Relatório”, clique na opção “Títulos”:

        // https://parceirohusqvarna.com/

        // Sua dúvida foi resolvida ?

        // Digite *1* para *SIM*
        // Digite *2* para *NÃO*`]
        //                 },
        //                 { type: 'aguardaResposta', params: [] }
        //             ]
        //         },

        {
            stepId: '1_2_1_1', //2011
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Você escolheu a opção: *Revenda/Financeiro/Boletos*

Digite a opção desejada:

1 - *Boletos A Vencer*
2 - *Boletos Em Atraso*
3 - *Supplier (Compra Fácil)*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_2_1_1_1" },
                            { respostaValue: "2", nextStepId: "1_2_1_1_2" },
                            { respostaValue: "3", nextStepId: "1_2_1_1_3" },
                            { respostaValue: "4", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_2_1_1_1',
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Para que possamos dar continuidade a emissão do(s) seu(s) boleto(s), por gentileza, informe o CPF ou CNPJ, apenas números, para consulta.`
                    },
                },
                {
                    type: 'aguardaCpfOuCnpj',
                    aguardaResposta: true,
                    params: { 'nextStep': `1_2_1_1_1_1` }
                }
            ]
        },
        {
            stepId: '1_2_1_1_1_1',
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Para facilitar a busca da informação dentro do sistema, você 
deseja realizar um filtro? Você pode:

 1. Consultar um boleto referente à uma NF específica
 2. Consultar boletos por um período
 3. Consultar todos o boletos disponíveis` },
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_2_1_1_1_1_1" },
                            { respostaValue: "2", nextStepId: "1_2_1_1_1_1_2" },
                            { respostaValue: "3", nextStepId: "1_2_1_1_1_1_3" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: '1_2_1_1_1_1_1',
            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': ` Informe, por gentileza, informe o número da nota 
fiscal que você deseja consultar...` },
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "1_2_1_1_1_1_1" },
                            { respostaValue: "2", nextStepId: "1_2_1_1_1_1_2" },
                            { respostaValue: "3", nextStepId: "1_2_1_1_1_1_3" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: 'PESQUISA_1', //333

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `*Pesquisa de Satisfação*

Sua solicitação foi atendida ?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "end" },
                            { respostaValue: "2", nextStepId: "PESQUISA_2" },
                            { respostaValue: "9", nextStepId: "end" },
                        ],
                    }
                }
            ]
        },
        {
            stepId: 'PESQUISA_2', //201112

            actions: [
                {
                    type: 'enviaMensagem',
                    aguardaResposta: false,
                    params: {
                        'conteudo': `Sentimos muito por isso!
Deseja nos dar mais detalhes sobre porque não conseguimos te ajudar?

Digite *1* para *SIM*
Digite *2* para *NÃO*`}
                },
                {
                    type: 'aguardaResposta',
                    aguardaResposta: true,
                    params: {
                        'respostasValidas': [
                            { respostaValue: "1", nextStepId: "queue" },
                            { respostaValue: "2", nextStepId: "end" },
                            { respostaValue: "9", nextStepId: "end" },
                        ]
                    }
                }
            ]
        },
        {
            stepId: 'end',
            actions: [
                {
                    type: 'encerrarInteracao',
                    aguardaResposta: false,
                    params: undefined,
                }
            ]
        },
        {
            stepId: 'queue',
            actions: [
                {
                    type: 'encaminharFila',
                    aguardaResposta: false,
                    params: { "nomeFila": "queue" }
                }
            ]
        },
        {
            stepId: 'suporte',
            actions: [
                {
                    type: 'encaminharFila',
                    aguardaResposta: false,
                    params: { 'nomeFila': "suporte" }
                }
            ]
        },



    ],
    dataCriacao: new Date(),
    ativo: true
}


export default flow;