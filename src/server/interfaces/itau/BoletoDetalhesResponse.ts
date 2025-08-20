// Interfaces principais
export interface BoletoResponse {
    data: Boleto[];
    page: PageInfo;
}

export interface Boleto {
    id_boleto: string;
    beneficiario: Beneficiario;
    dado_boleto: DadoBoleto;
    acoes_permitidas: AcoesPermitidas;
}

// Interfaces para Beneficiário
export interface Beneficiario {
    id_beneficiario: string;
    nome_cobranca: string;
    tipo_pessoa: TipoPessoa;
    endereco: Endereco;
}

export interface TipoPessoa {
    codigo_tipo_pessoa: string;
    numero_cadastro_nacional_pessoa_juridica?: string;
    numero_cadastro_nacional_pessoa_fisica?: string;
}

export interface Endereco {
    nome_logradouro: string;
    nome_bairro?: string;
    nome_cidade: string;
    sigla_UF: string;
    numero_CEP: string;
}

// Interfaces para Dados do Boleto
export interface DadoBoleto {
    descricao_instrumento_cobranca: string;
    forma_envio: string;
    tipo_boleto: string;
    quantidade_parcelas: number;
    pagador: Pagador;
    codigo_carteira: string;
    dados_individuais_boleto: DadoIndividualBoleto[];
    codigo_especie: string;
    descricao_especie: string;
    codigo_aceite: string;
    data_emissao: string;
    pagamento_parcial: boolean;
    quantidade_maximo_parcial: number;
    juros: Juros;
    protesto: Protesto;
    negativacao: Negativacao;
    codigo_tipo_vencimento: number;
    instrucao_cobranca: InstrucaoCobranca[];
    recebimento_divergente: RecebimentoDivergente;
    indicador_bloqueio: string;
    indicador_descontado: boolean;
}

export interface Pagador {
    pessoa: PessoaPagador;
    endereco: EnderecoPagador;
    email: string;
}

export interface PessoaPagador {
    nome_pessoa: string;
    tipo_pessoa: TipoPessoa;
}

export interface EnderecoPagador {
    nome_logradouro: string;
    nome_cidade: string;
    sigla_UF: string;
    numero_CEP: string;
    nome_bairro?: string;
}

export interface DadoIndividualBoleto {
    situacao_geral_boleto: string;
    status_vencimento: string;
    numero_nosso_numero: string;
    data_vencimento: string;
    valor_titulo: string;
    texto_seu_numero: string;
    dac_titulo: number;
    codigo_barras: string;
    numero_linha_digitavel: string;
    data_limite_pagamento: string;
    mensagens_cobranca: MensagemCobranca[];
}

export interface MensagemCobranca {
    mensagem: string;
}

export interface Juros {
    codigo_tipo_juros: string;
    quantidade_dias_juros: number;
    valor_juros: string;
    percentual_juros: string;
}

export interface Protesto {
    protesto_falimentar: boolean;
}

export interface Negativacao {
    // Pode conter propriedades específicas quando preenchido
    [key: string]: any;
}

export interface InstrucaoCobranca {
    codigo_instrucao_cobranca: number;
    quantidade_dias_instrucao_cobranca: number;
}

export interface RecebimentoDivergente {
    codigo_tipo_autorizacao: string;
    valor_minimo: string;
    percentual_minimo: string;
    valor_maximo: string;
    percentual_maximo: string;
}

export interface AcoesPermitidas {
    emitir_segunda_via: boolean;
    comandar_instrucao_alterar_dados_cobranca: boolean;
}

// Interface para Paginação
export interface PageInfo {
    links: PageLinks;
    page: number;
    total_pages: number;
    total_elements: number;
    page_size: number;
}

export interface PageLinks {
    first: string;
    last: string;
    previous: string;
    next: string;
}



