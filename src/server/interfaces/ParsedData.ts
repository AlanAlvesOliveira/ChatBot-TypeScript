export default interface ParsedData {
    composedSessionId: string;
    accountId: string;
    contactId: string;
    interactionId: string;
    messageFromClient: string;
    contactPhone?: string;
}
