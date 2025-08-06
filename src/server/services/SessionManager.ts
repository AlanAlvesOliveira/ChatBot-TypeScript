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
        }

        return currentSession;
    }

    public static endSession(sessionData: Session) {

        const sessionId = sessionData.getSessionData().composedSessionId

        const session = this.sessions.get(sessionId);

        if (session) {
            console.log(`🗑️ Encerrando sessão: ${sessionId}`);
            session.close(); // Garante que os timeouts são limpos antes de remover a sessão
            this.sessions.delete(sessionId);
        } else {
            console.warn(`⚠️ Tentativa de remover uma sessão inexistente: ${sessionId}`);
        }
    }

    public static getSessionKeys(): string[] {
        return Array.from(this.sessions.keys());
    }

}