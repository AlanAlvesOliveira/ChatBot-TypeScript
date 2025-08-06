import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SystemConfiguration } from '../interfaces/SystemConfiguration';

let systemConfiguration: SystemConfiguration | null = null;

const loadConfiguration = (): void => {
    if (systemConfiguration) return; // Evita recarregar se já estiver carregado

    const hostname = os.hostname().toLowerCase();
    let envKey: 'LOCALHOST' | 'DEV' | 'PROD' = 'LOCALHOST';

    if (hostname.includes('ss-ssaude')) {
        envKey = 'DEV';
    } else if (
        hostname.includes('inst-mds-queue-01') ||
        hostname.includes('inst-mds-chat-01') ||
        hostname.includes('inst-mds-chat-02')
    ) {
        envKey = 'PROD';
    }

    const configPath = path.resolve(__dirname, '../config.json');
    console.log(`🔍 Identificado ambiente: ${envKey}`);
    console.log(`📂 Carregando configurações do arquivo: ${configPath}`);

    try {
        if (!fs.existsSync(configPath)) {
            throw new Error(`Arquivo de configuração não encontrado: ${configPath}`);
        }

        const data = fs.readFileSync(configPath, 'utf8');
        const allConfigs = JSON.parse(data);

        if (!allConfigs[envKey]) {
            throw new Error(`Configuração para '${envKey}' não encontrada.`);
        }

        systemConfiguration = allConfigs[envKey] as SystemConfiguration;
        console.log(`✅ Configurações do ambiente '${envKey}' carregadas com sucesso.`);
    } catch (err) {
        console.error(`❌ Erro ao carregar as configurações:`, err);
        throw err;
    }
};

// Carrega a configuração uma única vez na inicialização do módulo
loadConfiguration();

export const getConfiguration = (): SystemConfiguration => {
    if (!systemConfiguration) {
        throw new Error("Configuração não carregada corretamente.");
    }
    return systemConfiguration;
};
