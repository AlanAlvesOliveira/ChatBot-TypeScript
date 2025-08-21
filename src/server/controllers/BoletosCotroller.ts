import { Request, response, Response } from "express";
import SessionManager from "../services/SessionManager";
import ItauApiService from "../services/ItauApiService";
import { BoletosRequest } from "../interfaces/itau/BoletosRequest";
import { BoletoDetalhesRequest } from "../interfaces/itau/BoletoDetalhesRequest";
import ItauBoletoService, { BoletoRequest } from "../services/ItauBoletoService";
//import ItauBoletoService, { BoletoRequest } from "../services/ItauBoletoService";

export default class BoletosCotroller {

    static async Teste(req: Request, res: Response) {

        try {
            // const result = await ItauApiService.GetToken();
            // if (!result?.access_token) throw new Error('Não foi possível pegar um novo Token');

            // // const boleto = {
            // //     idBeneficiario: "054800325679", //(Required) (4 dígitos agência)+(7 dígitos c/c)+(1 dígito DAC)
            // //     situacao: "aberto",
            // //     //cnpjPagador: "88662838000191"
            // //     cnpjPagador: "54557293000131"

            // // } as BoletosRequest

            // // const boletos = await ItauApiService.GetBoletoPorFiltro(boleto, result.access_token);

            // const boleto = {
            //     id_beneficiario: '054800325679',
            //     codigo_carteira: '112',
            //     nosso_numero: '39156952',
            //     BearerToken: result.access_token

            // } as BoletoDetalhesRequest

            // const detalhes = await ItauApiService.GetDetalhesBoleto(boleto)


            const boletoService = new ItauBoletoService();

            const request: BoletoRequest = {
                cpfCnpj: '88.662.838/0001-91',
                codigoBarras: '34191.12390 15695.250546 83256.790003 9 11860000187423'
            };

            try {
                const caminhoBoleto = await boletoService.downloadBoleto(request);
                console.log(`Boleto salvo em: ${caminhoBoleto}`);
            } catch (error) {
                console.error('Erro:', error);
            }

            res.status(200).send('ok');

        } catch (error: any) {
            console.log("ERROR: ", error);
            res.status(400).json({ message: error.message });
        }
    }
}