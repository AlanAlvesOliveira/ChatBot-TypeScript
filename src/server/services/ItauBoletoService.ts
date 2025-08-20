import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export interface BoletoRequest {
    cpfCnpj: string;
    codigoBarras: string;
    valor?: string;
    dataVencimento?: string;
}

export class ItauBoletoService {
    private downloadPath: string;

    constructor(downloadPath: string = path.join(__dirname, 'boletos')) {
        this.downloadPath = downloadPath;

        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath, { recursive: true });
        }
    }

    async downloadBoleto(request: BoletoRequest): Promise<string | undefined> {
        let browser: puppeteer.Browser | null = null;

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--window-size=1400,900',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    '--lang=pt-BR,pt;q=0.9,en;q=0.8',
                    '--disable-blink-features=AutomationControlled'
                ],
                defaultViewport: null,
            });

            const page = await browser.newPage();
            const client = await page.target().createCDPSession();
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: this.downloadPath
            });

            await page.goto('https://www.itau.com.br/servicos/boletos/segunda-via', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            const appComponent = await page.waitForSelector('app-emissaoboletos', { timeout: 3000 });
            if (!appComponent) throw new Error('Componente app-emissaoboletos não encontrado');

            const cpfInput = await appComponent.evaluateHandle(el => el.shadowRoot?.querySelector('input[id="billet-input_field-input-cpf_cnpj"]'));
            if (cpfInput) await cpfInput.asElement()?.type(request.cpfCnpj);

            const boletoInput = await appComponent.evaluateHandle(el => el.shadowRoot?.querySelector('input[id="billet-input_field-input-billetNumber"]'));
            if (boletoInput) await boletoInput.asElement()?.type(request.codigoBarras);

            const clickSuccess = await appComponent.evaluate(el => {
                const button = el.shadowRoot?.querySelector('button[id="billets-forms-button"]') as HTMLButtonElement | null;
                if (button) {
                    button.click();
                    return true;
                }
                return false;
            });

            if (!clickSuccess) throw new Error('Não foi possível clicar no botão para gerar boleto');

            await new Promise((resolve) => setTimeout(resolve, 5000));

            const pages = await browser.pages();
            const boletoPage = pages[pages.length - 1];
            await boletoPage.waitForSelector('a', { timeout: 15000 });

            const downloadSuccess = await boletoPage.evaluate(() => {
                const links = document.querySelectorAll('a');
                for (const link of links) {
                    const href = link.getAttribute('href');
                    const text = link.textContent?.toLowerCase();

                    if (href && (
                        href.includes('download') ||
                        href.includes('baixar') ||
                        href.includes('boleto') ||
                        href.includes('.pdf') ||
                        text?.includes('download') ||
                        text?.includes('baixar') ||
                        text?.includes('boleto') ||
                        link.getAttribute('download') !== null
                    )) {
                        link.click();
                        return true;
                    }
                }
                if (links.length > 0) {
                    links[0].click();
                    return true;
                }
                return false;
            });

            if (!downloadSuccess) throw new Error('Não foi possível encontrar o link de download');

            const downloadedFile = await this.waitForDownload(45000, `${request.codigoBarras}__${new Date().toLocaleString()}`);
            await boletoPage.close();

            return downloadedFile;

        } catch (error) {
            console.error('Erro ao baixar boleto:', error);
            return undefined;
        } finally {
            if (browser) {
                await browser.close().catch(err => console.error('Erro ao fechar browser:', err));
            }
        }
    }

    private waitForDownload(timeoutMs: number, customFileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Tempo limite excedido para o download')), timeoutMs);

            const existingFiles = new Set(fs.readdirSync(this.downloadPath).map(file => file.toLowerCase()));

            const checkInterval = setInterval(() => {
                try {
                    const files = fs.readdirSync(this.downloadPath);
                    const newFiles = files.filter(f =>
                        (f.endsWith('.pdf') || f.endsWith('.PDF')) &&
                        !f.endsWith('.crdownload') &&
                        !existingFiles.has(f)
                    );

                    if (newFiles.length > 0) {
                        const originalPath = path.join(this.downloadPath, newFiles[0]);
                        clearTimeout(timeout);
                        clearInterval(checkInterval);

                        const newFileName = this.sanitizeFileName(customFileName) + '.pdf';
                        const newPath = path.join(this.downloadPath, newFileName);
                        fs.renameSync(originalPath, newPath);

                        resolve(newPath);
                    }
                } catch {
                    // Ignora erros de leitura de diretório
                }
            }, 1000);
        });
    }

    private sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/\s+/g, '')
            .replace(/[:/,]/g, '_')
            .replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s_-]/g, '')
            .substring(0, 100);
    }
}

export default ItauBoletoService;
