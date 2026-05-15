import knex from 'knex';

console.log(process.env);
export const database = knex({
    client: process.env.DB_TYPE === 'mssql' ? 'mssql' : 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: parseInt(process.env.DB_PORT || '3306'),
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // MSSQL spezifisch (wird von MySQL einfach ignoriert)
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }
});