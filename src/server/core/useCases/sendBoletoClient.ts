import { Interaction } from '../../models/InteractionSession';
import ItauApiService from '../../services/ItauApiService';
import ItauBoletoService, { BoletoRequest } from '../../services/ItauBoletoService';
import XcallyApiService from '../../services/XcallyApiService';
import Session from '../Session';
import { BoletoDetalhesRequest } from '../../interfaces/itau/BoletoDetalhesRequest';
import { getConfiguration } from '../../utils/loadConfiguration';

const configJson = getConfiguration();

export async function sendBoleToClient(session: Session, codigoCarteira: string, nosso_numero: string) {
    try {

        const token = await ItauApiService.GetToken();
        if (!token?.access_token) throw new Error('Não foi possível pegar um novo Token');

        const boletoRequest: BoletoDetalhesRequest = {
            id_beneficiario: configJson.itau.id_beneficiario,
            codigo_carteira: codigoCarteira,
            nosso_numero: nosso_numero,
            BearerToken: token.access_token,
            view: 'full'
        }
        const detalhes = await ItauApiService.GetDetalhesBoleto(boletoRequest);

        const numero_linha_digitavel = detalhes?.data[0].dado_boleto.dados_individuais_boleto[0].numero_linha_digitavel;
        if (!numero_linha_digitavel) throw new Error('numero_linha_digitavel nao localizado');

        const boletoService = new ItauBoletoService();

        const dadosBanco = await Interaction.findByPk(session.interactionIdBd);

        if (!dadosBanco) throw Error('Não encontrei session.sessionDb.dadosClient')

        const { cnpj, cpf } = JSON.parse(dadosBanco.dadosClient || '{}');

        const request: BoletoRequest = {
            cpfCnpj: cnpj || cpf,
            codigoBarras: numero_linha_digitavel
        };

        console.log('detalhes -> ', request)
        const caminhoBoleto = await boletoService.downloadBoleto(request);

        if (!caminhoBoleto) throw new Error('caminhoBoleto não localizado');

        const formData = await XcallyApiService.createAttachment(caminhoBoleto);
        await XcallyApiService.sendDocumentToClient(session, formData);
    } catch (error) {
        console.log('[ERRO] imprimirBoleto ', error);
        await XcallyApiService.SendMessage("imprimirBoleto", session, "Ocorreu algum erro na impressão do boleto.");
    }
}