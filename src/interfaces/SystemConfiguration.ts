export interface SystemConfiguration {

    plugin: {
        port: number;
        TIMEOUT_INTERACAO_EM_SEGUNDOS: number;
    };

    xcally: {
        url: string;
        API_KEY: string;
        ID_FILA_PESQUISA_SATISFACAO: number;
    };

    xcallyServidorAtendimento: {
        url: string;
        API_KEY: string;
        ID_FILA_PESQUISA_SATISFACAO: number;
    };

    DATABASE: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
}
