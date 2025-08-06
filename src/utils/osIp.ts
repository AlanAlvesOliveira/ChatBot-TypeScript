import os from 'os';

export const osIp = (): string => {
    const networkInterfaces = os.networkInterfaces();
    let serverIp = 'NÃO IDENTIFICADO'; // Fallback para localhost se nenhum IP for encontrado

    Object.keys(networkInterfaces).forEach((interfaceName) => {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
            for (const iface of interfaces) {
                // Pega o primeiro IPv4 não interno (loopback)
                if (iface.family === 'IPv4' && !iface.internal) {
                    serverIp = iface.address;
                    break;
                }
            }
        }
    });

    return serverIp;
};