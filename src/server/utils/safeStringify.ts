export function safeStringify(obj: any, indent = 2) {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                // Encontrou referência circular, ignora
                return undefined;
            }
            cache.add(value);
        }

        // Remove propriedades específicas que causam problemas
        if (value && typeof value === 'object') {
            // Remove propriedades internas do Node.js
            const { _idlePrev, _idleNext, _idleStart, _destroyed, ...cleanValue } = value;
            return cleanValue;
        }

        return value;
    }, indent);
}

