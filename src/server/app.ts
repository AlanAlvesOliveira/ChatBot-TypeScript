import { Config } from './../../node_modules/sequelize/types/sequelize.d';
import express, { Application, Request, Response } from 'express';
import { getConfiguration } from './utils/loadConfiguration';
import chatbotRouters from "./routers/chatbotRouters"

const app: Application = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('API em TypeScript funcionando!');
});

app.use("/api", chatbotRouters);

const config = getConfiguration();

app.listen(config.plugin.port, () => {
    console.log(`Servidor rodando na porta http://${config.evn?.toLowerCase()}:${config.plugin.port} `);
});

export default app;