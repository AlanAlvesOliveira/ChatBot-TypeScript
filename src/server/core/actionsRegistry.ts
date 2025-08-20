import { Interaction } from './../models/InteractionSession';
import XcallyApiService from "../services/XcallyApiService";
import Session from "./Session";
import { ResultAction } from '../interfaces/ResultAction';
import { ActionDefinition } from "../interfaces/ActionDefinition";
import { validaRespotaUsuario } from "./useCases/validaResposta";
import { aguardaCpfOuCnpj } from "./useCases/aguardaCpfOuCnpj";
import { aguardarNumeroNotafiscal } from "./useCases/aguardarNumeroNotafiscal";
import ItauApiService from "../services/ItauApiService";
import { BoletosRequest } from "../interfaces/itau/BoletosRequest";
import { BoletoDetalhesRequest } from '../interfaces/itau/BoletoDetalhesRequest';
import ItauBoletoService, { BoletoRequest } from '../services/ItauBoletoService';
import { send } from 'process';



type ActionHandler = (session: Session, params: ActionDefinition | undefined) => Promise<ResultAction>;

type ActionRegistry = {
    [Key in ActionDefinition["type"]]: ActionHandler
}

const actionRegistry: ActionRegistry = {
    "enviaMensagem": async (session, args) => {
        if (args?.type !== 'enviaMensagem') throw new Error('actionRegistry -> enviaMensagem');
        return await XcallyApiService.SendMessage("enviaMensagem", session, args?.params.conteudo);
    },
    "aguardaResposta": async (session, args) => {
        if (args?.type !== 'aguardaResposta') throw new Error('actionRegistry -> aguardaResposta');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const currentStep = await session.getCurrentStep();
            const actionsComResposta = currentStep.actions.filter(x => x.aguardaResposta);
            if (actionsComResposta.length > 1) throw new Error(`Encontrei mais de uma ação esperando resposta no step ${currentStep.stepId}`);
            const action = actionsComResposta[0];
            if (action.type != 'aguardaResposta') throw new Error('aguardaResposta');
            const resposta = action.params.respostasValidas;
            const nextStep = await validaRespotaUsuario(session, resposta);
            return { success: true, nextStep }
        }
    },
    "encerrarInteracao": async (session, args) => {
        if (args?.type !== 'encerrarInteracao') throw new Error('actionRegistry -> encerrarInteracao');
        return session.closeInteractionAndRemoveSession('end', "Obrigado por entrar em contato. Este atendimento foi encerrado.");
    },
    "encaminharFila": async (session, args) => {
        if (args?.type !== 'encaminharFila') throw new Error('actionRegistry -> encaminharFila');
        return await session.encaminhaFila(args.params.nomeFila);
    },
    "aguardaCpfOuCnpj": async (session, args) => {

        if (args?.type !== 'aguardaCpfOuCnpj') throw new Error('actionRegistry -> aguardaCpfOuCnpj');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const nextStep = await aguardaCpfOuCnpj(session, args.params.nextStep);
            return { success: true, nextStep }
        }
    },
    "aguardarNumeroNotafiscal": async (session, args) => {
        if (args?.type !== 'aguardarNumeroNotafiscal') throw new Error('actionRegistry -> aguardarNumeroNotafiscal');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            await aguardarNumeroNotafiscal(session);
            return { success: true }
        }
    },
    "aguardarFiltroDias": async (session, args) => {
        if (args?.type !== 'aguardarFiltroDias') throw new Error('actionRegistry -> aguardarFiltroDias');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {

            const currentStep = await session.getCurrentStep();
            const actionsComResposta = currentStep.actions.filter(x => x.aguardaResposta);
            if (actionsComResposta.length > 1) throw new Error(`Encontrei mais de uma ação esperando resposta no step ${currentStep.stepId}`);
            const action = actionsComResposta[0];
            if (action.type != 'aguardarFiltroDias') throw new Error('aguardarFiltroDias');
            const resposta = action.params.respostasValidas;
            const nextStep = await validaRespotaUsuario(session, resposta);


            if (nextStep) {
                let tipo = '';
                switch (session.parsedData.messageFromClient.trim()) {
                    case '1':
                        tipo = 'a vencer'
                        break;
                    case '2':
                        tipo = 'atrasados'
                        break;
                    default:
                        throw new Error('registraTipoBoletoSolicitado não encontrado');
                        break;
                }
                await session.updateDadosDatabase({ tipoBoletoSolicitado: tipo });

            }
            return { success: true, nextStep }
        }
    },

    "ListarBoletos": async (session, args) => {

        if (args?.type !== 'ListarBoletos') throw new Error('actionRegistry -> ListarBoletos');


        if (!session.sessionDb.aguardandoResposta) {

            const token = await ItauApiService.GetToken();
            if (!token?.access_token) throw new Error('Não foi possível pegar um novo Token');

            const dadosBanco = await Interaction.findByPk(session.interactionIdBd);

            if (!dadosBanco) throw Error('Não encontrei session.sessionDb.dadosClient')

            const { cnpj, cpf, tipoBoletoSolicitado } = JSON.parse(dadosBanco.dadosClient || '{}');

            const boleto = {
                idBeneficiario: "054800325679", //composto de "${agencia}${conta}${dac}"
                situacao: "aberto",
                cnpjPagador: cnpj || cpf
            } as BoletosRequest

            const listaBoletosOriginal = await ItauApiService.GetBoletoPorFiltro(boleto, token.access_token);

            console.log('listaBoletosOriginal-> ', listaBoletosOriginal);

            if (!listaBoletosOriginal) throw new Error('Erro em GetBoletoPorFiltro');

            let boletosFiltrados;

            if (tipoBoletoSolicitado === 'a vencer') {
                console.log('entrei em a vencer')
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas

                //pega data do cliente
                const dataCalculada = CalcularData(session.parsedData.messageFromClient);

                // Filtrar os boletos
                boletosFiltrados = listaBoletosOriginal.data.filter(boleto => {
                    // Converter a string da data
                    const dataVencimento = new Date(boleto.dataVencimento);
                    // Verificar se está entre hoje e dataCalculada
                    return dataVencimento >= hoje && dataVencimento <= dataCalculada;
                }).map(boleto => ({
                    dataVencimento: formatarDataDDMM(new Date(boleto.dataVencimento)),
                    valor: formatarMoeda(boleto.valor),
                    codigoCarteira: boleto.codigoCarteira,
                    nosso_numero: boleto.nossoNumero
                }));

            } else if (tipoBoletoSolicitado === 'atrasados') {

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas

                boletosFiltrados = listaBoletosOriginal.data.filter(boleto => {
                    // Converter a string da data
                    const dataVencimento = new Date(boleto.dataVencimento);
                    // Verificar se está entre hoje e dataCalculada
                    return dataVencimento <= hoje;
                }).map(boleto => ({
                    dataVencimento: formatarDataDDMM(new Date(boleto.dataVencimento)),
                    valor: formatarMoeda(boleto.valor),
                    codigoCarteira: boleto.codigoCarteira,
                    nosso_numero: boleto.nossoNumero
                }));


            } else {
                throw new Error('ListarBoletos tipoBoletoSolicitado não encontrada ')
            }
            session.addBoletos(boletosFiltrados);

            let msg = `Pronto! Localizei ${boletosFiltrados.length} ${tipoBoletoSolicitado} boletos no meu sistema. Por 
favor, selecione qual boleto você deseja:\n`;

            for (let index = 0; index < boletosFiltrados.length; index++) {
                const element = boletosFiltrados[index];
                msg += `${index + 1}. ${element.dataVencimento} no valor de ${element.valor}\n`
            }

            //console.log('chegeui aqui ===> ', boletosProximos7Dias);

            await XcallyApiService.SendMessage("ListarBoletos", session, msg);
            return await session.updateAguardandoResposta(true);
        } else {
            await aguardarNumeroNotafiscal(session);
            return { success: true }
        }
    },
    "BaixarBoleto": async (session, args) => {
        if (args?.type !== 'BaixarBoleto') throw new Error('actionRegistry -> BaixarBoleto');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            try {
                const opcao = parseInt(session.parsedData.messageFromClient);
                const boletos = session.getBoletos();
                if (!boletos) throw new Error('sem boletos em memoria')
                const boleto = boletos[opcao];
                if (!boleto) {
                    await XcallyApiService.SendMessage("BaixarBoleto", session, "Opção inválida para boletos");
                } else {

                    const token = await ItauApiService.GetToken();
                    if (!token?.access_token) throw new Error('Não foi possível pegar um novo Token');

                    const boletoRequest: BoletoDetalhesRequest = {
                        id_beneficiario: '054800325679',
                        codigo_carteira: boleto.codigoCarteira,
                        nosso_numero: boleto.nosso_numero,
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

                    const caminhoBoleto = await boletoService.downloadBoleto(request);

                    if (!caminhoBoleto) throw new Error('caminhoBoleto não localizado');

                    const formData = await XcallyApiService.createAttachment(caminhoBoleto);
                    await XcallyApiService.sendDocumentToClient(session, formData);
                }

            } catch (error) {
                console.log(error);

            }

            return { success: true }
        }
    },
};


function CalcularData(msg: string): Date {

    const dataCalculada = new Date();
    dataCalculada.setHours(0, 0, 0, 0);
    // Converte para UTC ajustando o offset
    const offset = dataCalculada.getTimezoneOffset();
    dataCalculada.setMinutes(dataCalculada.getMinutes() - offset);

    switch (msg.trim()) {
        case '1': // Próximos 7 dias
            dataCalculada.setDate(dataCalculada.getDate() + 7);
            break;
        case '2': // Próximos 15 dias
            dataCalculada.setDate(dataCalculada.getDate() + 15);
            break;
        case '3': // Próximos 30 dias
            dataCalculada.setDate(dataCalculada.getDate() + 30);
            break;
        default:
            throw new Error('Não foi possível CalcularData')
    }
    return dataCalculada;
}

function formatarDataDDMM(data: Date) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
}

function formatarMoeda(valor: string) {
    // Converte string para número (caso já não seja)
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;

    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}
export default actionRegistry;
