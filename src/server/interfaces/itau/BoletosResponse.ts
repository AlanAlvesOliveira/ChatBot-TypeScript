export interface BoletosResponse {
    data: Boleto[];
    pagination: Pagination;
}

interface Pagador {
    nomePagador: string;
    tipoPessoa: "Física" | "Jurídica" | string;
    numeroDocumento: string;
}

interface Boleto {
    idBoleto: string;
    instrumentoCobranca: string;
    pagador: Pagador;
    situacaoVencimento: string;
    indicadorDescontado: boolean;
    seuNumero: string;
    dataEntrada: string; // Date no formato ISO (YYYY-MM-DD)
    dataEmissao: string; // Date no formato ISO (YYYY-MM-DD)
    dataVencimento: string; // Date no formato ISO (YYYY-MM-DD)
    valor: string; // Decimal como string
    codigoCarteira: string;
    situacao: "aberto" | "liquidado" | "cancelado" | string;
    nossoNumero: string;
    dataLimitePagamento: string; // Date no formato ISO (YYYY-MM-DD)
}

interface PaginationLinks {
    first: string;
    last: string;
    previous: string;
    next: string;
}

interface Pagination {
    links: PaginationLinks;
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
}
