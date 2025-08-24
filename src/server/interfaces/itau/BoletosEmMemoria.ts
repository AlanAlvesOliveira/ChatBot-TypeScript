import { ResultAction } from '../ResultAction';
import { SystemConfiguration } from './../SystemConfiguration';
export interface BoletosEmMemoria {
    todosBoletos: Boleto[];
    boletosFiltrados?: Boleto[];
    paginaAtual: number
    boletoSelecionado?: Boleto
    menuRespostas: MenuRespostas[];
    menuAnterior: string;
}
export interface MenuRespostas {
    texto: string;           // Texto que será exibido
    valor: string;
    action: () => Promise<ResultAction>;
}
export interface Boleto {
    dataVencimentoFormatada: string;
    dataVencimento: Date
    valor: string;
    codigoCarteira: string;
    seuNumero: string
    nosso_numero: string;
    dataEmissao: Date;
    dataEntrada: Date;
}
