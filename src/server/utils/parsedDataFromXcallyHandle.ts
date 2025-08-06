import { Request } from "express";
import ParsedData from "../interfaces/ParsedData";

const parsedDataHandleFromValue = (req: Request): ParsedData => {
    try {
        // Obtendo o campo 'value' da requisição
        const { value } = req.body;

        if (!value || typeof value !== "string") {
            throw new Error("Campo 'value' ausente ou inválido.");
        }

        // Criando um objeto a partir da string (query string style)
        const params = new URLSearchParams(value);

        // Extraindo os valores corretamente
        const accountId = params.get("accountId") ?? "";
        const contactId = params.get("contactId") ?? "";
        const interactionId = params.get("interactionId") ?? "";
        const messageFromClient = params.get("message") ?? "inicio pesquisa satisfação";
        const contactPhone = params.get("contactPhone") ?? undefined;

        // Verificando se há campos obrigatórios ausentes
        const requiredFields = { accountId, contactId, interactionId, messageFromClient };
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


const parsedDataHandle = (req: Request): ParsedData => {
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

const parseContextFromJson = (json: any): ParsedData => {
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



export default { parsedDataHandle, parseContextFromJson, parsedDataHandleFromValue };
