import express, { Application, Request, Response } from 'express';
import { getConfiguration } from './utils/loadConfiguration';

const app: Application = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('API em TypeScript funcionando!');
});


const PORT = getConfiguration().plugin.port || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;