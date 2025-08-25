import { MenuRespostas } from './../interfaces/itau/BoletosEmMemoria';
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
import { Boleto, BoletosEmMemoria } from '../interfaces/itau/BoletosEmMemoria';
import steps from "./flows/flow_v1"
import { sendBoleToClient } from './useCases/sendBoletoClient';
import { Tags } from '../models/XcallyTags/Tags';


type ActionHandler = (session: Session, params: ActionDefinition) => Promise<ResultAction>;

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
            if (nextStep) {
                return { success: true, nextStep }
            } else {
                return { success: false }
            }
        }
    },
    "aguardarNumeroNotafiscal": async (session, args) => {
        if (args?.type !== 'aguardarNumeroNotafiscal') throw new Error('actionRegistry -> aguardarNumeroNotafiscal');
        if (!session.sessionDb.aguardandoResposta) {
            return await session.updateAguardandoResposta(true);
        } else {
            const nextStep = await aguardarNumeroNotafiscal(session, args.params.nextStep);
            return { success: true, nextStep }
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

            const { cnpj, cpf, tipoBoletoSolicitado, notaFiscal } = JSON.parse(dadosBanco.dadosClient || '{}');

            console.log(`-> filtros [cnpj, ${cnpj},cpf ${cpf},tipoBoletoSolicitado ${tipoBoletoSolicitado},noteFiscal ${notaFiscal}]`);

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

                if (!listaBoletosOriginal) {
                    //cpf é válido mas não tem na base do itaú
                    await XcallyApiService.SendMessage("cpf válido, mas não existe na base", session, ` Olha, como não consegui encontrar o CPF/
 CNPJ, estou te transferindo para um dos 
nossos colaboradores. `);
                    await AtualizaBd(session, 'queue');
                    await XcallyApiService.addTag(session, Tags.OCORRENCIA_BOLETOS_CPF_CNPJ_FORA_DA_BASE);
                    const nextStep = await session.getCurrentStep();
                    return { success: true, nextStep }
                }

                const todosBoletos: Boleto[] = listaBoletosOriginal.data.map(boleto =>
                ({
                    dataVencimentoFormatada: formatarDataDDMM(new Date(boleto.dataVencimento)),
                    dataVencimento: new Date(boleto.dataVencimento),
                    dataEmissao: new Date(boleto.dataEmissao),
                    dataEntrada: new Date(boleto.dataEntrada),
                    valor: formatarMoeda(boleto.valor),
                    codigoCarteira: boleto.codigoCarteira,
                    nosso_numero: boleto.nossoNumero,
                    seuNumero: boleto.seuNumero,

                }))
                    //ordena de modo crescente
                    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

                boletosEmMemoria = {
                    todosBoletos: todosBoletos,
                    paginaAtual: 1,
                    boletoSelecionado: undefined,
                    boletosFiltrados: undefined,
                    menuRespostas: [],
                    menuAnterior: session.sessionDb.statusAntigo || ''
                }

                console.log(`Adicionando boletos em memória -> ${JSON.stringify(boletosEmMemoria)}`);
                session.addBoletos(boletosEmMemoria);

            } else {
                //limpa as resposta para construir um novo menu dinâmico
                boletosEmMemoria.menuRespostas = [];
                session.addBoletos(boletosEmMemoria);
            }

            let boletosFiltrados: Boleto[] = boletosEmMemoria.todosBoletos;

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);


            if (!notaFiscal && tipoBoletoSolicitado) {
                switch (tipoBoletoSolicitado) {
                    case 'a vencer':
                        const dataCalculada = CalcularData(dadosBanco);
                        if (dataCalculada) {
                            boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                                return boleto.dataVencimento >= hoje && boleto.dataVencimento <= dataCalculada;
                                //return dataCalculada <= boleto.dataEntrada;
                                //return dataCalculada <= boleto.dataEmissao;
                            });
                        } else {
                            boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                                return boleto.dataVencimento >= hoje;
                            });
                        }
                        break;
                    case 'atrasados':
                        boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                            return boleto.dataVencimento <= hoje;
                            //return boleto.dataEntrada <= hoje;
                            //return boleto.dataEmissao <= hoje;
                        });
                        break;
                    default:
                        //boletosFiltrados = boletosEmMemoria?.todosBoletos;
                        throw new Error('ListarBoletos tipoBoletoSolicitado não encontrada ');
                }
            }


            if (notaFiscal) {
                boletosFiltrados = boletosEmMemoria?.todosBoletos.filter(boleto => {
                    return boleto.seuNumero.includes(notaFiscal);
                });

            }

            let boletosPaginados;
            const totalFiltradosAntesPaginacoa = boletosFiltrados?.length || 0
            if (boletosEmMemoria.paginaAtual !== -1) { //opção para mostrar tudo
                boletosPaginados = paginar(boletosFiltrados, boletosEmMemoria.paginaAtual)
                boletosFiltrados = boletosPaginados.boletosFiltrados;
                boletosEmMemoria.boletosFiltrados = boletosFiltrados;
            } else {
                boletosEmMemoria.boletosFiltrados = boletosFiltrados;
            }


            if (boletosFiltrados && boletosFiltrados.length <= 0) {
                await XcallyApiService.SendMessage("ListarBoletos", session, 'Não foram encontrados boletos para os filtros selecionados.');

                return { success: true };

            } else if (boletosFiltrados && boletosFiltrados.length === 1) {

                //TODO, não testado
                const msg = `Pronto! Localizei no meu sistema um boleto 
com vencimento para o dia ${boletosFiltrados[0].dataVencimentoFormatada}, no 
valor de ${boletosFiltrados[0].valor}. 

Aguarde um momento.

Abaixo, segue o 
boleto para o pagamento:`

                await XcallyApiService.SendMessage("Listaboleos : Um boleto encontrado", session, msg);
                await sendBoleToClient(session, boletosFiltrados[0].codigoCarteira, boletosFiltrados[0].nosso_numero);
                const nextStep = steps.steps.find(x => x.stepId === 'end');
                return { success: true, nextStep }

            } else if (boletosFiltrados && boletosFiltrados.length === 1) {
                //todo
                await XcallyApiService.SendMessage("ListarBoletos", session, '1 boleto encontrado');
            } else if (boletosFiltrados && boletosFiltrados.length > 0) {




                boletosEmMemoria.menuRespostas?.push({
                    valor: "ignorar",
                    texto: `Pronto! Localizei ${totalFiltradosAntesPaginacoa} boletos ${tipoBoletoSolicitado} no meu sistema. Por favor, selecione qual boleto você deseja: \n\n`,
                    action: async () => {
                        return { success: true }
                    }
                });

                for (let index = 0; index < boletosFiltrados.length; index++) {
                    const element = boletosFiltrados[index];
                    const key = `${index + 1}`
                    boletosEmMemoria.menuRespostas?.push({
                        valor: key,
                        texto: `${index + 1}. *${element.dataVencimentoFormatada}* no valor de *${element.valor}*\n`,
                        action: async () => {

                            const actionBaixarBoleto = '1_2_1_1_1_1_2_1_1';
                            await AtualizaBd(session, actionBaixarBoleto); //menu 
                            boletosEmMemoria.boletoSelecionado = boletosFiltrados[index];
                            session.addBoletos(boletosEmMemoria);
                            await session.updateAguardandoResposta(false);
                            const nextStep = await session.getCurrentStep();
                            return { success: true, nextStep }
                        }
                    });
                }

                if (boletosPaginados && boletosPaginados.hasNext) {
                    boletosEmMemoria.menuRespostas?.push({
                        valor: '4',
                        texto: `\n4. Outras Opções`,
                        action: async () => {
                            boletosEmMemoria.paginaAtual = boletosEmMemoria.paginaAtual + 1;
                            session.addBoletos(boletosEmMemoria);
                            await session.updateAguardandoResposta(false);
                            return { success: true }
                        }
                    });
                }

                if (boletosEmMemoria && boletosEmMemoria.paginaAtual !== -1 && (boletosPaginados && boletosPaginados.hasNext)) {
                    boletosEmMemoria.menuRespostas?.push({
                        valor: '5',
                        texto: `\n5. Todos os boletos`,
                        action: async () => {
                            boletosEmMemoria.paginaAtual = -1;
                            session.addBoletos(boletosEmMemoria);
                            return await session.updateAguardandoResposta(false);
                        }
                    });
                }

                if (boletosEmMemoria && boletosEmMemoria.paginaAtual !== -1) {
                    boletosEmMemoria.menuRespostas?.push({
                        valor: '6',
                        texto: `\n6. Voltar ao menu anterior`,
                        action: async () => {
                            //todo ver o caso do outros tipos de boleto
                            await AtualizaBd(session, boletosEmMemoria.menuAnterior);
                            await session.updateAguardandoResposta(false);
                            const nextStep = await session.getCurrentStep();
                            return { success: true, nextStep }
                        }
                    });
                }

                if (boletosEmMemoria.paginaAtual === -1) {
                    const key = `${boletosFiltrados.length + 1}`
                    boletosEmMemoria.menuRespostas?.push({
                        valor: key,
                        texto: `\n${key}. Voltar ao menu anterior`,
                        action: async () => {
                            //todo ver o caso do outros tipos de boleto
                            const statusAntigo = session.sessionDb.statusAntigo;
                            if (!statusAntigo) throw new Error('Não foi possível localizar o status antigo');
                            await AtualizaBd(session, statusAntigo);
                            await session.updateAguardandoResposta(false);
                            const nextStep = await session.getCurrentStep();
                            return { success: true, nextStep }
                        }
                    });
                }


                if (boletosEmMemoria.menuRespostas && boletosEmMemoria.menuRespostas.length > 0) {
                    const grandeString = boletosEmMemoria.menuRespostas
                        .map(menu => menu.texto)
                        .join('');

                    await XcallyApiService.SendMessage("ListarBoletos", session, grandeString);
                } else {
                    throw new Error('Ocorreu algum erro para juntar as respotas')
                }

            }

        } else {


            let boletosEmMemoria: BoletosEmMemoria | undefined = session.getBoletos();


            if (!boletosEmMemoria) throw new Error('não encontrei boletosEmMemoria')
            const boletosFiltrados = boletosEmMemoria.boletosFiltrados
            if (!boletosFiltrados) throw new Error('não enconrei boletosFiltrados em memoria')
            const nextStep = steps.steps.find(x => x.stepId === '1_2_1_1_1_1_2_1_1');

            if (!nextStep) throw new Error('nao encontrei step 1_2_1_1_1_1_2_1_1');
            console.log('$$$$$$$$ newStep ', nextStep.stepId);

            const respostaUsuario = session.parsedData.messageFromClient;
            const opcaoEncontrada = boletosEmMemoria.menuRespostas?.find(menu =>
                menu.valor === respostaUsuario
            );

            if (opcaoEncontrada) {
                console.log(JSON.stringify(opcaoEncontrada))
                console.log('Resposta válida encontrada!');
                return await opcaoEncontrada.action()
            } else {
                //TODO, TESTAR
                await XcallyApiService.SendMessage('Lista', session, ` Olha, como não consegui entender a sua 
solicitação, vou te transferir para um dos 
nossos colaboradores...`);
                await AtualizaBd(session, 'queue');
                const nextStep = await session.getCurrentStep();
                return { success: true, nextStep }
            }
        }
        return { success: true }
    },
    "BaixarBoleto": async (session, args) => {
        if (args?.type !== 'BaixarBoleto') throw new Error('actionRegistry -> BaixarBoleto');

        console.log('-----------> entrei em BaixarBoleto')

        if (!session.sessionDb.aguardandoResposta) {

            try {
                const boletos = session.getBoletos();
                if (!boletos) throw new Error('sem boletos em memoria')
                boletos.menuRespostas = [];
                const boleto = boletos.boletoSelecionado;
                console.log(`boleto selecionado para impressão ${JSON.stringify(boleto)} `)
                if (!boleto) {
                    await XcallyApiService.SendMessage("BaixarBoleto", session, "Ocorreu algum erro na impressão do boleto");
                } else {

                    await sendBoleToClient(session, boleto.codigoCarteira, boleto.nosso_numero);

                    await new Promise((resolve) => setTimeout(resolve, 3000));


                    if (boletos?.boletosFiltrados?.length && boletos?.boletosFiltrados?.length > 1) {

                        //case mais de 1 boleto
                        boletos.menuRespostas.push({
                            valor: 'ignorar',
                            texto: 'Você deseja emitir outro boleto?\n',
                            action: async () => {
                                return { success: true }
                            }
                        });
                        boletos.menuRespostas.push({
                            valor: '1',
                            texto: '\n1. SIM',
                            action: async () => {
                                //TODO TESTAR
                                await AtualizaBd(session, '1_2_1_1_1_1_2_1'); // lista boletos
                                const nextStep = await session.getCurrentStep();
                                return { success: true, nextStep }
                            }
                        });
                        boletos.menuRespostas.push({
                            valor: '2',
                            texto: '\n2. NÃO',
                            action: async () => {
                                //TODO TESTAR
                                await XcallyApiService.SendMessage('', session, `Obrigado pela atenção! Tchau!`);
                                await XcallyApiService.addTag(session, Tags.OCORRENCIA_BOLETOS_SOLICITAÇAO_FINALIZADA)
                                await AtualizaBd(session, 'end');
                                const nextStep = await session.getCurrentStep();
                                return { success: true, nextStep }
                            }
                        });
                        await XcallyApiService.SendMessage('BaixarBoleto:'
                            , session, boletos.menuRespostas
                                .map(menu => menu.texto).join(''));
                    } else {

                        //case um boleto
                        boletos.menuRespostas.push({
                            valor: 'ignorar',
                            texto: 'Sua solicitação foi resolvida?\n',
                            action: async () => {
                                return { success: true }
                            }
                        });
                        boletos.menuRespostas.push({
                            valor: '1',
                            texto: '\n1. SIM',
                            action: async () => {
                                //todo encerrar
                                await XcallyApiService.SendMessage('', session, `Obrigado pela atenção! Tchau!`);
                                await XcallyApiService.addTag(session, Tags.OCORRENCIA_BOLETOS_SOLICITAÇAO_FINALIZADA);
                                await AtualizaBd(session, 'end');
                                const nextStep = await session.getCurrentStep();
                                return { success: true, nextStep }
                            }
                        });
                        boletos.menuRespostas.push({
                            valor: '2',
                            texto: '\n2. NÃO',
                            action: async () => {
                                await XcallyApiService.SendMessage('', session, `Aguarde enquanto transferimos`);
                                await AtualizaBd(session, 'queue');
                                const nextStep = await session.getCurrentStep();
                                return { success: true, nextStep }
                            }
                        });
                        await XcallyApiService.SendMessage('BaixarBoleto:'
                            , session, boletos.menuRespostas
                                .map(menu => menu.texto).join(''));
                    }
                }
                await session.updateAguardandoResposta(true);
                return { success: true }
            } catch (error) {
                console.log(error)
                await XcallyApiService.SendMessage("BaixarBoleto", session, "Infelizmente ocorreu algum erro na impressão do boleto");
                return { success: false }
            }

        } else {


            //esperando resposta

            let boletosEmMemoria: BoletosEmMemoria | undefined = session.getBoletos();


            if (!boletosEmMemoria) throw new Error('não encontrei boletosEmMemoria')
            const boletosFiltrados = boletosEmMemoria.boletosFiltrados
            if (!boletosFiltrados) throw new Error('não enconrei boletosFiltrados em memoria')
            const nextStep = steps.steps.find(x => x.stepId === '1_2_1_1_1_1_2_1_1');

            if (!nextStep) throw new Error('nao encontrei step 1_2_1_1_1_1_2_1_1');
            console.log('$$$$$$$$ newStep ', nextStep.stepId);

            const respostaUsuario = session.parsedData.messageFromClient;
            const opcaoEncontrada = boletosEmMemoria.menuRespostas?.find(menu =>
                menu.valor === respostaUsuario
            );

            if (opcaoEncontrada) {
                console.log(JSON.stringify(opcaoEncontrada))
                console.log('Resposta válida encontrada!');
                return await opcaoEncontrada.action()
            } else {
                //TODO, TESTAR
                await XcallyApiService.SendMessage('Lista', session, ` Olha, como não consegui entender a sua 
solicitação, vou te transferir para um dos 
nossos colaboradores...`);
                await AtualizaBd(session, 'queue');
                const nextStep = await session.getCurrentStep();
                return { success: true, nextStep }
            }

        }
    },
};

async function AtualizaBd(session: Session, nextStep: string) {
    console.log('-> atualizando bd')
    session.sessionDb.statusAntigo = session.sessionDb.sessionStatus;
    session.sessionDb.sessionStatus = nextStep;
    session.sessionDb.aguardandoResposta = false;
    session.sessionDb.countAnswerError = 0;
    await session.sessionDb.save();
}

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

function CalcularData(interactionBd: Interaction): Date | undefined {


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
            console.log('-> Não foi possível CalcularData')
            return undefined;
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
