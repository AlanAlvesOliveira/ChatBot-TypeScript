export interface SystemConfiguration {

    plugin: {
        port: number;
        TIMEOUT_INTERACAO_EM_SEGUNDOS: number;
        TIMEOUT_INTERACAO_AVISO_EM_SEGUNDOS: number;
    };

    xcally: {
        url: string;
        API_KEY: string;
        ID_OPEN_CHANNEL: number;
    };


    DATABASE: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
}
