export interface BoletoDetalhesRequest {
    BearerToken: string;
    id_beneficiario: string;
    codigo_carteira: string;
    nosso_numero: string;
    view: 'full';
    //data_inclusao : 2024-11-01
}