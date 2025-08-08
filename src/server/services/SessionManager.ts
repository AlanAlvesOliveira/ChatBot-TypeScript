import Session from "../core/Session";
import ParsedData from "../interfaces/ParsedData";

export default class SessionManager {
    private static sessions: Map<string, Session> = new Map();

    public static async createOrGetSession(data: ParsedData): Promise<Session> {

        const sessionId = data.composedSessionId;
        let currentSession = this.sessions.get(sessionId);

        if (!currentSession) {

            console.log(`🆕 Criando nova sessão: ${sessionId}`);
            currentSession = await Session.newSession(data);

            if (currentSession.salvarEmMemoria) {
                this.sessions.set(sessionId, currentSession);
            }
        } else {
            currentSession.updateParsedDataInMemory(data);
        }

        return currentSession;
    }

    public static cleanSessionFromMemoria(sessionData: Session, string: string) {

        const sessionId = sessionData.getSessionData().composedSessionId

        const session = this.sessions.get(sessionId);

        if (session) {
            console.log(`🗑️ Encerrando sessão an memoria: ${sessionId}, context: ${string}`);
            this.sessions.delete(sessionId);
        } else {
            console.warn(`⚠️ Tentativa de remover uma sessão inexistente: ${sessionId}`);
        }
    }

    public static getSessionKeys(): string[] {
        return Array.from(this.sessions.keys());
    }

}