import { Request } from "express";
import ParsedData from "../interfaces/ParsedData";

export default class ParsedHandle {
    static parsedDataHandleFromValue = (req: Request): ParsedData => {
        try {
            // Obtendo o campo 'value' da requisição
            const { value } = req.body;

            if (!value || typeof value !== "string") {
                throw new Error("Campo 'value' ausente ou inválido.");
            }

            // Criando um objeto a partir da string (query string style)
            const params = new URLSearchParams(value);


            // Extraindo os valores corretamente
            let accountId = params.get("accountId") ?? "";
            if (!accountId) {
                accountId = params.get("AccountId") ?? "";
            }
            let contactId = params.get("contactId") ?? "";
            if (!contactId) {
                contactId = params.get("ContactId") ?? "";
            }
            let interactionId = params.get("interactionId") ?? "";
            if (!interactionId) {
                interactionId = params.get("InteractionId") ?? "";
            }
            let messageFromClient = params.get("message") ?? "";

            if (!messageFromClient) {
                messageFromClient = params.get("Message") ?? "";
            }

            let contactPhone = params.get("contactPhone") ?? undefined;
            if (!contactPhone) {
                contactPhone = params.get("telefone") ?? undefined;
            }

            // Verificando se há campos obrigatórios ausentes
            const requiredFields = { accountId, contactId, interactionId };
            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value.trim())
                .map(([key]) => key);

            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(", ")}`);
            }

            return {
                composedSessionId: `OpenChannel${accountId}${interactionId}`,
                accountId,
                contactId,
                interactionId,
                messageFromClient,
                contactPhone,
            };
        } catch (error: any) {
            console.error("Erro ao processar parsedDataHandle:", error.message);
            throw new Error(error.message);
        }
    };


    static parsedDataHandle = (req: Request): ParsedData => {
        try {
            // Obtendo os valores do corpo da requisição diretamente como JSON
            const { AccountId, ContactId, InteractionId, Message, contactPhone } = req.body;

            // Normalizando os valores para string (caso venham como números)
            const data = {
                accountId: AccountId?.toString() ?? "",
                contactId: ContactId?.toString() ?? "",
                interactionId: InteractionId?.toString() ?? "",
                messageFromClient: Message?.toString() ?? "inicio pesquisa satisfação",
                contactPhone: contactPhone?.toString() ?? undefined
            };

            // Lista de campos obrigatórios que devem estar preenchidos
            const requiredFields: (keyof typeof data)[] = [
                "accountId",
                "contactId",
                "interactionId",
                "messageFromClient",
                "contactPhone"
            ];

            // Coleta os campos ausentes
            const missingFields = requiredFields.filter(
                (field) => !data[field].trim()
            );

            // Se houver campos ausentes, lança um erro com a lista completa
            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(", ")}`);
            }

            return {
                composedSessionId: `OpenChannel${data.accountId}${data.interactionId}`,
                accountId: data.accountId,
                contactId: data.contactId,
                interactionId: data.interactionId,
                messageFromClient: data.messageFromClient,
                contactPhone: data.contactPhone
            };
        } catch (error: any) {
            console.error("Erro ao processar parsedDataHandle:", error.message);
            throw new Error(error.message);
        }
    };

    static parseContextFromJson = (json: any): ParsedData => {
        try {
            // Extraindo os valores do contexto
            const { contactId, interactionId, sourceAccountId } = json.context;

            // Normalizando os valores para string (caso venham como números)
            const data = {
                accountId: sourceAccountId?.toString() ?? "",
                contactId: contactId?.toString() ?? "",
                interactionId: interactionId?.toString() ?? "",
                messageFromClient: "inicio pesquisa satisfação", // Valor padrão
            };

            // Lista de campos obrigatórios que devem estar preenchidos
            const requiredFields: (keyof typeof data)[] = [
                "accountId",
                "contactId",
                "interactionId",
                "messageFromClient"
            ];

            // Coleta os campos ausentes
            const missingFields = requiredFields.filter(
                (field) => !data[field].trim()
            );

            // Se houver campos ausentes, lança um erro com a lista completa
            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(", ")}`);
            }

            return {
                composedSessionId: `OpenChannel${data.accountId}${data.interactionId}`,
                accountId: data.accountId,
                contactId: data.contactId,
                interactionId: data.interactionId,
                messageFromClient: data.messageFromClient,
            };
        } catch (error: any) {
            console.error("Erro ao processar parseContextFromJson:", error.message);
            throw new Error(error.message);
        }
    };

}




