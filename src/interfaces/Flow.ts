import { StoredStep } from "./StoredStep";

export interface Flow {
    idFlow: string;
    nome: string;
    steps: StoredStep[];
    dataCriacao: Date;
    ativo: boolean;
}