const passos = {
    end: {
        text: `end`,
        answers: {},
    },
    queue: {
        text: `queue`,
        answers: {},
    },
    suporte: {
        text: `suporte`,
        answers: {},
    },
    // ============================================ Menu Inicial ============================================
    // ============================================ 1 - Consumidor ou 2 - Revenda ===========================
    0: { //1
        text: `
*Bem-vindo a Husqvarna*

Digite a opção desejada:

1 - *Consumidor*
2 - *Revenda*.`,
        answers: {
            0: "",
        },
    },
    1: { // 1
        text: `
*Bem-vindo a Husqvarna*

Digite a opção desejada:

1 - *Consumidor*
2 - *Revenda*.`,
        answers: {
            1: "10",
            2: "20",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor
    10: { //1_1
        text: `
Você escolheu a opção: *Consumidor*

Digite a opção desejada:

1 - *E-commerce*
2 - *Pós-Vendas e Suporte*

Digite *8* para *Retornar ao Menu Inicial* ou
Digite *9* para *Encerrar seu Atendimento*`,
        answers: {
            1: "101",
            2: "102",
            9: "end",
            8: "1",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/E-commerce
    101: { //1_1_1
        text: `
Você escolheu a opção: *Consumidor/E-commerce*

Digite a opção desejada:

1 - *Dúvidas Sobre Pedido*
2 - *Status de Entrega*
3 - *Agendamento de Entrega Técnica*
4 - *Troca e Devoluções*
5 - *Outros Assuntos*`,
        answers: {
            1: "queue",
            2: "queue",
            3: "queue",
            4: "1014",
            5: "1015",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/E-commerce/Troca e Devolução
    1014: { //1_1_1_1
        text: `
Você escolheu a opção: *Consumidor/E-commerce/Trocas e Devoluções*

Em caso de trocas/devoluções consulte nossa política abaixo:

https://www.lojahusqvarna.com.br/Institucional/trocas-e-devolucoes

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "333",
            2: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/E-commerce/Outros Assuntos
    1015: { //1_1_1_2
        text: `
Você escolheu a opção: *Consumidor/E-commerce/Outros Assuntos*

Para demais assuntos, consultar nossa página de atendimento no link abaixo:

https://www.lojahusqvarna.com.br/institucional/atendimento

Se preferir, entre em contato conosco em nosso telefone 0800 022 9801 ou e-mail sac.brasil@husqvarnagroup.com

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "333",
            2: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/Pós-Vendas e Suporte
    102: { // 1_1_2
        text: `
Você escolheu a opção: *Consumidor/Pós-Vendas e Suporte*

Digite a opção desejada:

1 - *Agendamento de Entrega Técnica*
2 - *Localizar Assistência Técnica ou Revenda Autorizada*
3 - *Garantia*
4 - *Suporte Técnico*
5 - *Outros Assuntos*`,
        answers: {
            1: "queue",
            2: "1022",
            3: "queue",
            4: "suporte",
            5: "1025",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/Pós-Vendas e Suporte/Localizar assistência
    1022: { //1_1_2_1
        text: `
Você escolheu a opção: *Consumidor/Pós-Vendas e Suporte/Localizar Assistência Técnica ou Revenda Autorizada*

Para localizar uma Assistência Técnica ou Revenda autorizada Husqvarna, acesse o link abaixo e pesquise digitando a Rua, Bairro, Cidade ou Estado da sua preferência para visualizar as autorizadas na região:

https://www.husqvarna.com/br/revendedor/

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "333",
            2: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Consumidor/Pós-Vendas e Suporte/Outros Assuntos
    1025: { //1_1_2_2
        text: `
Você escolheu a opção: *Consumidor/Pós-Vendas e Suporte/Outros Assuntos*

Para demais assuntos, consultar nossa página de atendimento no link abaixo:

https://www.lojahusqvarna.com.br/institucional/atendimento

Se preferir, entre em contato conosco em nosso telefone 0800 022 9801 ou e-mail sac.brasil@husqvarnagroup.com

Sua dúvida foi esclarecida?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "333",
            2: "queue",
            9: "end",
        },
    },
    // ============================================ FLUXO Menu Inicial > 2 Revenda ===========================
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Revenda
    20: { //1_2
        text: `
Você escolheu a opção: *Revenda*

Digite a opção desejada:

1 - *Financeiro*
2 - *Pós-Vendas e Suporte*

Digite *8* para *Retornar ao Menu Inicial* ou
Digite *9* para *Encerrar seu Atendimento*`,
        answers: {
            1: "201",
            2: "202",
            8: "1",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Revenda/Financeiro
    201: { //1_2_1
        text: `
Você escolheu a opção: *Revenda/Financeiro*

Digite a opção desejada:

1 - *Boletos*
2 - *Outros Assuntos*`,
        answers: {
            1: "2011",
            2: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Revenda/Pós-Vendas e Suporte
    202: { // 1_2_2
        text: `
Você escolheu a opção: *Revenda/Pós-Venda e Suporte*

Digite a opção desejada:

1 - *Garantia*
2 - *Suporte Técnico*
3 - *Informações Sobre Pedido de Compra*
4 - *Dúvidas*
5 - *Se Tornar Autorizada Husqvarna*
6 - *Outros Assuntos*`,
        answers: {
            1: "queue",
            2: "suporte",
            3: "queue",
            4: "queue",
            5: "queue",
            6: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Revenda/Financeiro/Boletos
    2011: { //esse foi substituido 1_2_1_1
        text: `
Você escolheu a opção: *Revenda/Financeiro/Boletos*

Para baixar a 2ª via de boleto, acesse o link abaixo e insira o seu login e senha de Revenda. Em seguida, na parte de “Relatório”, clique na opção “Títulos”:

https://parceirohusqvarna.com/

Sua dúvida foi resolvida ?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "333",
            2: "queue",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Escolheu opção: Revenda/Financeiro/Boletos (Pesquisa > Solicitação Não Atendida)
    201112: { //PESQUISA_2
        text: `
Sentimos muito por isso!
Deseja nos dar mais detalhes sobre porque não conseguimos te ajudar?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "queue",
            2: "end",
            9: "end",
        },
    },
    // >>>>>>>>>>>>>> PESQUISA DE SATISFAÇÃO <<<<<<<<<<<<<<<<
    333: { //PESQUISA_1
        text: `
*Pesquisa de Satisfação*

Sua solicitação foi atendida ?

Digite *1* para *SIM*
Digite *2* para *NÃO*`,
        answers: {
            1: "end",
            2: "201112",
            9: "end",
        },
    },
};