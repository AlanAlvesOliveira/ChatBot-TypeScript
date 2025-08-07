const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Caminho da pasta `dist`
const sourceFolder = path.join(__dirname, 'dist');

// Função para gerar o arquivo `.zip`
const createZip = async (zipName, folderName, manifestContent) => {
    // Caminho de saída do arquivo zip
    const outputPath = path.join(__dirname, 'dist', zipName);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Mensagem de conclusão ou erro
    output.on('close', () => {
        console.log(`Arquivo ${zipName} criado com ${archive.pointer()} bytes.`);
    });
    archive.on('error', (err) => {
        throw err;
    });

    // Inicia o processo de compactação
    archive.pipe(output);

    // Cria o arquivo `manifest.json` temporariamente
    const manifestPath = path.join(__dirname, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));

    // Adiciona todo o conteúdo de `dist` dentro de uma subpasta `chatbot` no zip
    archive.glob('**/*', {
        cwd: sourceFolder,
        ignore: ['node_modules/**', '.git/**', '*.zip', 'manifest.json'] // Ignora arquivos desnecessários
    }, { prefix: folderName }); // Prefixo coloca tudo dentro da pasta chatbot no zip

    // Inclui o `manifest.json` na raiz da pasta chatbot dentro do zip
    archive.file(manifestPath, { name: `${folderName}/manifest.json` });

    // Finaliza o arquivo `.zip`
    await archive.finalize();

    // Remove o arquivo `manifest.json` temporário
    fs.unlinkSync(manifestPath);
    return outputPath;
};

// Conteúdo do `manifest.json`
const manifestChat01 = {
    "name": "novoChatbot",
    "version": "1.0.1",
    "description": "todo - localização do código",
    "author": {
        "name": "TELEDATA",
        "email": "suporte@teledatabrasil.com.br",
        "website": ""
    },
    "type": "script",
    "sidebar": "adminOnly",
    "parameters": {
        "scriptName": "novoChatbot",
        "scriptPath": "server/index.js",
        "views": {
            "admin": "client/admin/index.html"
        }
    }
};

// Gera o arquivo zip
(async () => {
    try {
        const outputPath = await createZip('novoChatbot.zip', 'novoChatbot', manifestChat01);
        console.log('Arquivo novoChatbot.zip criado com sucesso na pasta dist!');
        console.log('outputPath ', outputPath);

    } catch (err) {
        console.error('Erro ao criar o arquivo zip:', err);
    }
})();