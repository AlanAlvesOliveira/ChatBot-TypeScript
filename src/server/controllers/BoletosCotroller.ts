import { Request, response, Response } from "express";
import SessionManager from "../services/SessionManager";
import ItauApiService from "../services/ItauApiService";
import { BoletosRequest } from "../interfaces/itau/BoletosRequest";

export default class BoletosCotroller {

    static async Teste(req: Request, res: Response) {

        try {
            const result = await ItauApiService.GetToken();
            if (!result?.access_token) throw new Error('Não foi possível pegar um novo Token');

            const boleto = {
                idBeneficiario: "054800325679",
                situacao: "aberto",
                //cnpjPagador: "88662838000191"
                cnpjPagador: "54557293000131"

            } as BoletosRequest

            const boletos = await ItauApiService.GetBoletoPorFiltro(boleto, result.access_token);
            res.status(200).send(boletos);

        } catch (error: any) {
            console.log("ERROR: ", error);
            res.status(400).json({ message: error.message });
        }
    }
}