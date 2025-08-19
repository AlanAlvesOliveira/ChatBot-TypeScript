import { BoletosRequest } from './../interfaces/itau/BoletosRequest';
import axios from "axios";
import { getConfiguration } from "../utils/loadConfiguration";
import fs from 'fs';
import https from 'https'
import { response } from "express";
import { BoletosResponse } from '../interfaces/itau/BoletosResponse';
import { OAuthTokenResponse } from '../interfaces/itau/OAuthTokenResponse';


const configJson = getConfiguration();

const cert = configJson.itau.KEY_CERTIFICADO_CRT;
const key = configJson.itau.KEY_CHAVE_PRIVADA;

const httpsAgent = new https.Agent({
    cert,
    key,
    rejectUnauthorized: true
});

export default class ItauApiService {

    static async GetToken(): Promise<OAuthTokenResponse | undefined> {
        try {

            const url = `https://sts.itau.com.br/api/oauth/token`;

            const params = new URLSearchParams();

            params.append('grant_type', 'client_credentials');
            params.append('client_id', configJson.itau.clientId);
            params.append('client_secret', configJson.itau.clientSecret);

            const response = await axios.post(url, params, {
                httpsAgent, // Usa o agente configurado com o certificado
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;

        } catch (error) {

            // Tratamento para erros do Axios
            console.log(error)
        }
    }


    static async GetBoletoPorFiltro(boletosRequest: BoletosRequest, token: string): Promise<BoletosResponse | undefined> {
        try {

            const url = new URL('https://boleto.api.itau.com/boleto/v1/boletos');
            url.searchParams.append('idBeneficiario', boletosRequest.idBeneficiario);
            url.searchParams.append('cnpjPagador', boletosRequest.cnpjPagador);
            url.searchParams.append('situacao', boletosRequest.situacao);
            url.searchParams.append('order', 'asc');

            //url.searchParams.append('dataEntrada', '2024-10-31');

            const response = await axios.get(url.toString(), {
                httpsAgent, // Usa o agente configurado com o certificado
                headers: {
                    'Accept': 'application/json',
                    'x-itau-correlationID': configJson.itau.x_itau_correlationID, //(Required) UUID que identifica a transação.
                    'x-itau-apikey': configJson.itau.clientId, //(Required) Chave que identifica o chamador.
                    'x-itau-flowid': configJson.itau.x_itau_flowid, //Chave que identifica o fluxo de negócio. Deve ser diferente do __x-itau-correlationid__.
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;

        } catch (error) {

            // Tratamento para erros do Axios
            console.log(error)
        }
    }
}

