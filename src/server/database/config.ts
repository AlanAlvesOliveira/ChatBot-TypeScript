import { Sequelize } from 'sequelize-typescript';
import { getConfiguration } from '../utils/loadConfiguration';
import { Dialect } from 'sequelize/types';
import { Interaction } from '../models/InteractionSession';

let sequelize: Sequelize;


/**
 * Garante que o banco de dados MySQL existe, criando-o se necessário.
 */
// async function ensureDatabaseExists(
//     host: string,
//     database: string,
//     username: string,
//     password: string
// ): Promise<void> {


//     const { DB_PORT, DB_DIALECT } = await getConfiguration();

//     if (!DB_DIALECT || !DB_PORT) {
//         throw new Error('DB_DIALECT ou DB_PORT vazio');
//     }
//     const validatedDialect = DB_DIALECT as Dialect;

//     const tempSequelize = new Sequelize({
//         timezone: 'America/Sao_Paulo',
//         dialect: validatedDialect,
//         host,
//         username,
//         password,
//         port: DB_PORT,
//         logging: false,
//     });


//     try {

//         switch (DB_DIALECT) {
//             case "mysql":
//                 await tempSequelize.query(
//                     `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
//                 );
//                 break;

//             case "postgres":

//                 // Verifica se o banco já existe
//                 const [results] = await tempSequelize.query(
//                     `SELECT 1 FROM pg_database WHERE datname = '${database}'`
//                 );

//                 // Se não existir, cria o banco
//                 if (results.length === 0) {
//                     await tempSequelize.query(`
//                         CREATE DATABASE "${database}"                       
//                     `);
//                 }
//                 break;
//         }


//         console.log(`✅ Banco de dados '${database}' verificado/criado com sucesso.`);
//     } catch (error) {
//         console.error('❌ Erro ao verificar/criar o banco de dados:', error);
//         throw error;
//     } finally {
//         await tempSequelize.close();
//     }
// }

/**
 * Cria uma instância Sequelize com os modelos definidos.
 */
async function createConnection(
    host: string,
    database: string,
    username: string,
    password: string
): Promise<Sequelize> {

    const config = await getConfiguration();

    // if (!DB_DIALECT || !DB_PORT) {
    //     throw new Error('DB_DIALECT ou DB_PORT vazio');
    // }
    const validatedDialect = "mysql" as Dialect;

    const instance = new Sequelize({
        dialect: validatedDialect,
        host,
        database,
        username,
        password,
        port: config.DATABASE.port,
        logging: false,
        models: [Interaction],
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    });

    return instance;
}

/**
 * Testa a conexão com o banco e sincroniza os modelos, se aplicável.
 */
async function sincronizeTables(env: string): Promise<boolean> {
    try {

        if (env !== 'prod') {
            await sequelize.sync({ alter: false }); // Desenvolvimento: ajusta as tabelas conforme os modelos
            console.log('✅ Modelos sincronizados com o banco de dados (modo desenvolvimento).');
        } else if (env === 'prod') {
            await sequelize.sync({ alter: false }); // Produção: só cria se não existir, sem alterar
            console.log('ℹ️ Ambiente de produção detectado. Modelos criados se necessário, sem alterações.');
        }


        return true;
    } catch (error) {
        console.error('❌ Falha ao autenticar ou sincronizar com o banco de dados:', error);
        return false;
    }
}

/**
 * Inicializa a conexão com o banco de dados, garantindo sua existência e sincronização.
 */
async function initializeDatabase(): Promise<Sequelize> {
    try {

        const config = getConfiguration();
        const { host, username, password, dbname } = config.DATABASE;

        //await ensureDatabaseExists(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD);
        sequelize = await createConnection(host, dbname, username, password);

        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

        if (!config.evn) throw new Error('ENV não identificado!');
        const connected = await sincronizeTables(config.evn);
        if (!connected) throw new Error('Falha na verificação de conexão.');

        return sequelize;
    } catch (error) {
        console.error('❌ Erro crítico na inicialização do banco de dados:', error);
        process.exit(1);
    }
}

export { initializeDatabase, sincronizeTables as testConnection, sequelize };
