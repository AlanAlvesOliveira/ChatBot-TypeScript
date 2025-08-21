export interface BoletosEmMemoria {
    todosBoletos: Boleto[];
    boletosFiltrados?: Boleto[];
    paginaAtual: number
    boletoSelecionado?: Boleto
}

export interface Boleto {
    dataVencimentoFormatada: string;
    dataVencimento: Date
    valor: string;
    codigoCarteira: string;
    nosso_numero: string;
    dataEmissao: Date;
    dataEntrada: Date;
}
