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
import { Boleto, BoletosEmMemoria } from '../interfaces/itau/BoletosEmMemoria';
import { getConfiguration } from '../utils/loadConfiguration';
import { Index } from 'sequelize-typescript';
const configJson = getConfiguration();



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
            if (action.type != 'aguardaResposta') throw new Error('aguardaResposta não encontrado');
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
    "aguardaRespostaDiasValidos": async (session, args) => {
        if (args?.type !== 'aguardaRespostaDiasValidos') throw new Error('actionRegistry -> aguardaRespostaDiasValidos');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const currentStep = await session.getCurrentStep();
            const actionsComResposta = currentStep.actions.filter(x => x.aguardaResposta);
            if (actionsComResposta.length > 1) throw new Error(`Encontrei mais de uma ação esperando resposta no step ${currentStep.stepId}`);
            const action = actionsComResposta[0];
            if (action.type != 'aguardaRespostaDiasValidos') throw new Error('aguardaResposta não encontrado');

            const resposta = action.params.respostasValidas;
            const nextStep = await validaRespotaUsuario(session, resposta);

            if (nextStep) {
                switch (session.parsedData.messageFromClient) {
                    case '1':
                        await session.updateDadosDatabase({ opcaoDias: '7 dias' })
                        break;
                    case '2':
                        await session.updateDadosDatabase({ opcaoDias: '15 dias' })
                        break;
                    case '3':
                        await session.updateDadosDatabase({ opcaoDias: '30 dias' })
                        break;
                    default:
                        break;
                }
            }

            return { success: true, nextStep }
        }

        return { success: true }
    },

    "ListarBoletos": async (session, args) => {

        if (args?.type !== 'ListarBoletos') throw new Error('actionRegistry -> ListarBoletos');

        if (!session.sessionDb.aguardandoResposta) {
            await session.updateAguardandoResposta(true);

            const dadosBanco = await Interaction.findByPk(session.interactionIdBd);
            if (!dadosBanco) throw Error('Não encontrei session.sessionDb.dadosClient')

            const { cnpj, cpf, tipoBoletoSolicitado } = JSON.parse(dadosBanco.dadosClient || '{}');


            let boletosEmMemoria: BoletosEmMemoria | undefined = session.getBoletos();

            if (!boletosEmMemoria) {

                const token = await ItauApiService.GetToken();
                if (!token?.access_token) throw new Error('Não foi possível pegar um novo Token');



                const boleto = {
                    idBeneficiario: "054800325679", //composto de "${agencia}${conta}${dac}"
                    situacao: "aberto",
                    cnpjPagador: cnpj || cpf
                } as BoletosRequest

                const listaBoletosOriginal = await ItauApiService.GetBoletoPorFiltro(boleto, token.access_token)
                if (!listaBoletosOriginal) throw new Error('Erro em GetBoletoPorFiltro');
                const todosBoletos: Boleto[] = listaBoletosOriginal.data.map(boleto =>
                ({
                    dataVencimentoFormatada: formatarDataDDMM(new Date(boleto.dataVencimento)),
                    dataVencimento: new Date(boleto.dataVencimento),
                    dataEmissao: new Date(boleto.dataEmissao),
                    dataEntrada: new Date(boleto.dataEntrada),
                    valor: formatarMoeda(boleto.valor),
                    codigoCarteira: boleto.codigoCarteira,
                    nosso_numero: boleto.nossoNumero
                }))
                    //ordena de modo crescente
                    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

                boletosEmMemoria = {
                    todosBoletos: todosBoletos,
                    paginaAtual: 1,
                    boletoSelecionado: undefined,
                    boletosFiltrados: undefined
                }

                console.log(`Adicionando boletos em memória -> ${JSON.stringify(boletosEmMemoria)}`);
                session.addBoletos(boletosEmMemoria);

            }

            let boletosFiltrados: Boleto[] | undefined;

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);


            switch (tipoBoletoSolicitado) {
                case 'a vencer':
                    const dataCalculada = CalcularData(dadosBanco);
                    boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                        return boleto.dataVencimento >= hoje && boleto.dataVencimento <= dataCalculada;
                    });
                    break;
                case 'atrasados':
                    boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                        return boleto.dataVencimento <= hoje;
                    });
                    break;
                default:
                    throw new Error('ListarBoletos tipoBoletoSolicitado não encontrada ');

            }

            let boletosPaginados;
            if (boletosEmMemoria.paginaAtual !== -1) { //opção para mostrar tudo
                boletosPaginados = paginar(boletosFiltrados, boletosEmMemoria.paginaAtual)
                boletosFiltrados = boletosPaginados.boletosFiltrados;
                boletosEmMemoria.boletosFiltrados = boletosFiltrados;
            } else {
                boletosEmMemoria.boletosFiltrados = boletosFiltrados;
            }


            if (boletosFiltrados && boletosFiltrados.length <= 0) {
                await XcallyApiService.SendMessage("ListarBoletos", session, 'Não tem boletos com os filtro selecionados');
                return { success: true };

            } else if (boletosFiltrados && boletosFiltrados.length === 1) {
                //todo
                await XcallyApiService.SendMessage("ListarBoletos", session, '1 boleto encontrado');
            } else if (boletosFiltrados && boletosFiltrados.length === 1) {
                //todo
                await XcallyApiService.SendMessage("ListarBoletos", session, '1 boleto encontrado');
            } else if (boletosFiltrados && boletosFiltrados.length > 0) {



                let msg = `Pronto! Localizei ${boletosFiltrados.length} ${tipoBoletoSolicitado} boletos no meu sistema. Por favor, selecione qual boleto você deseja: \n\n`;
                for (let index = 0; index < boletosFiltrados.length; index++) {
                    const element = boletosFiltrados[index];
                    msg += `${index + 1}. ${element.dataVencimentoFormatada} no valor de ${element.valor}\n`
                }
                msg += `${boletosPaginados && boletosPaginados.hasNext ? '4. Outras Opções' : ''}
${boletosEmMemoria.paginaAtual !== -1 ? '5. Todos os boletos' : ''}
${boletosEmMemoria.paginaAtual !== -1 ? '\n6. Voltar ao menu anterior' : ''}`
                msg += `${boletosEmMemoria.paginaAtual === -1 ? `\n${boletosFiltrados.length + 1}. Voltar ao menu anterior` : ''}`

                //${boletosEmMemoria.paginaAtual !=== -1 ? '${boletosFiltrados.length + 1}' : '${Voltar ao menu anterior}'
                //console.log('chegeui aqui ===> ', boletosProximos7Dias);
                await XcallyApiService.SendMessage("ListarBoletos", session, msg);
            }

        } else {

            let boletosEmMemoria: BoletosEmMemoria | undefined = session.getBoletos();
            if (!boletosEmMemoria) throw new Error('')
            const boletosFiltrados = boletosEmMemoria.boletosFiltrados
            if (!boletosFiltrados) throw new Error('')

            switch (session.parsedData.messageFromClient) {
                case '1':
                    //pega boleto 1
                    boletosEmMemoria.boletoSelecionado = boletosFiltrados[0]
                    return
                    break;
                case '2':
                    //pega boleto 2
                    boletosEmMemoria.boletoSelecionado = boletosFiltrados[1]
                    break;
                case '3':
                    //pega boleto 3
                    boletosEmMemoria.boletoSelecionado = boletosFiltrados[2]
                    break;
                case '4':
                    //pega boleto mais tres boletos
                    boletosEmMemoria.paginaAtual = boletosEmMemoria.paginaAtual + 1;
                    session.addBoletos(boletosEmMemoria);
                    return await session.updateAguardandoResposta(false);
                case '5':
                    boletosEmMemoria.paginaAtual = -1;
                    session.addBoletos(boletosEmMemoria);
                    return await session.updateAguardandoResposta(false);
                case '6':
                    await XcallyApiService.SendMessage('', session, 'Voltar ao meneu anterior');
                    break;
                default:
                    await XcallyApiService.SendMessage('', session, 'Opção inválida!');
                    break;
            }


        }
        return { success: true }
    },
    "BaixarBoleto": async (session, args) => {
        if (args?.type !== 'BaixarBoleto') throw new Error('actionRegistry -> BaixarBoleto');

        console.log('-----------> entrei em BaixarBoleto')

        if (!session.sessionDb.aguardandoResposta) {
            console.log('-----------> entrei em BaixarBoleto setei uguardando resposta')
            return await session.updateAguardandoResposta(true);
        } else {
            try {
                const opcao = parseInt(session.parsedData.messageFromClient);

                const boletos = session.getBoletos();
                console.log(`boletos em memória ${JSON.stringify(boletos)} `)
                if (!boletos) throw new Error('sem boletos em memoria')
                const boleto = boletos.boletoSelecionado;
                console.log(`boleto selecionado ${JSON.stringify(boleto)} `)
                if (!boleto) {
                    await XcallyApiService.SendMessage("BaixarBoleto", session, "Opção inválida para boletos");
                } else {

                    const token = await ItauApiService.GetToken();
                    if (!token?.access_token) throw new Error('Não foi possível pegar um novo Token');

                    const boletoRequest: BoletoDetalhesRequest = {
                        id_beneficiario: configJson.itau.id_beneficiario,
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

                    console.log('detalhes -> ', request)
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

function paginar(boletosFiltrados: Boleto[], paginaAtual: number) {
    const itensPorPagina = 3;
    const startIndex = (paginaAtual - 1) * itensPorPagina;
    const endIndex = startIndex + itensPorPagina;

    const boletosPagina = boletosFiltrados.slice(startIndex, endIndex);
    const totalItens = boletosFiltrados.length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const hasNext = paginaAtual < totalPaginas;
    const hasPrevious = paginaAtual > 1;

    return {
        boletosFiltrados: boletosPagina,
        paginaAtual,
        totalPaginas,
        totalItens,
        hasNext,
        hasPrevious
    };
}

function CalcularData(interactionBd: Interaction): Date {


    const dataCalculada = new Date();
    dataCalculada.setHours(0, 0, 0, 0);
    // Converte para UTC ajustando o offset
    const offset = dataCalculada.getTimezoneOffset();
    dataCalculada.setMinutes(dataCalculada.getMinutes() - offset);

    const dadosCliente = interactionBd.dadosClient;
    if (!dadosCliente) throw new Error('dadosCliente não encontrado')

    const dados = JSON.parse(dadosCliente);

    switch (dados.opcaoDias) {
        case '7 dias':
            dataCalculada.setDate(dataCalculada.getDate() + 7);
            break;
        case '15 dias':
            dataCalculada.setDate(dataCalculada.getDate() + 15);
            break;
        case '30 dias':
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
