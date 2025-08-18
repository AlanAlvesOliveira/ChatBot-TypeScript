import { BoletosRequest } from './../interfaces/itau/BoletosRequest';
import axios from "axios";
import { getConfiguration } from "../utils/loadConfiguration";
import fs from 'fs';
import https from 'https'
import { response } from "express";


const configJson = getConfiguration();

export default class ItauApiService {

    static async GetToken(): Promise<any> {
        try {

            const cert = configJson.itau.KEY_CERTIFICADO_CRT;
            const key = configJson.itau.KEY_CHAVE_PRIVADA;

            const httpsAgent = new https.Agent({
                cert,
                key,
                rejectUnauthorized: true
            });

            const url = `https://sts.itau.com.br/api/oauth/token`;
            const clientId = configJson.itau.clientId;
            const clientSecret = configJson.itau.clientSecret;
            const params = new URLSearchParams();

            params.append('grant_type', 'client_credentials');
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);

            const response = await axios.post(url, params, {
                httpsAgent, // Usa o agente configurado com o certificado
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response;

        } catch (error) {

            // Tratamento para erros do Axios
            console.log(error)
        }
    }


    static async GetBoletoPorFiltro(boletosRequest: BoletosRequest, token: string): Promise<any> {
        try {

            const cert = configJson.itau.KEY_CERTIFICADO_CRT;
            const key = configJson.itau.KEY_CHAVE_PRIVADA;

            const httpsAgent = new https.Agent({
                cert,
                key,
                rejectUnauthorized: true
            });

            const url = new URL('https://boleto.api.itau.com/boleto/v1/boletos');
            url.searchParams.append('idBeneficiario', boletosRequest.idBeneficiario);
            url.searchParams.append('cnpjPagador', boletosRequest.cnpjPagador);
            url.searchParams.append('situacao', boletosRequest.situacao);

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
            return response;

        } catch (error) {

            // Tratamento para erros do Axios
            console.log(error)
        }
    }
}

