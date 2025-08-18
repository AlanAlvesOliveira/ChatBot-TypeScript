export interface BoletosRequest {
    idBeneficiario: string; //idBeneficiario : (Required) Id do beneficiário, composto de "${agencia}${conta}${dac}", sem traços ou pontos.
    cnpjPagador: string;
    situacao: 'aberto' | 'emPagamento' | 'pago' | 'cancelado';
}