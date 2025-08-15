export interface SystemConfiguration {

    evn?: string;

    plugin: {
        port: number;
        TIMEOUT_INTERACAO_EM_SEGUNDOS: number;
        TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS: number;
        MAXIMO_INTERACOES: number;
        INTERVALO_PARA_VERIFICACAO_EM_MINUTOS: number;
    };

    xcally: {
        url: string;
        API_KEY: string;
        ID_OPEN_CHANNEL: number;
    };
    itau: {
        url: string;
        API_KEY: string;
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
