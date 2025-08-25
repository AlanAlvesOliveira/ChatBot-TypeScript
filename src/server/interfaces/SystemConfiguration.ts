export interface SystemConfiguration {

    evn?: string;

    plugin: {
        port: number;
        TIMEOUT_INTERACAO_EM_SEGUNDOS: number;
        TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS: number;
        MAXIMO_INTERACOES_24_HORAS: number;
    };

    xcally: {
        url: string;
        API_KEY: string;
        ID_OPEN_CHANNEL: number;
    };

    itau: {
        id_beneficiario: string;
        url: string;
        clientId: string;
        clientSecret: string;
        KEY_CERTIFICADO_CRT: string;
        KEY_CHAVE_PRIVADA: string;
        x_itau_correlationID: string;
        x_itau_flowid: string;
    }

    DATABASE: {
        dbname: string
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
}
