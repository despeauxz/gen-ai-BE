import * as dotenv from 'dotenv'
dotenv.config()

const production = {
    dbPassword: process.env.PROD_DB_PASSWORD,
    dbUsername: process.env.PROD_DB_USER,
    dbName: process.env.PROD_DB_NAME,
    dbPort: process.env.PROD_DB_PORT,
    dbHost: process.env.PROD_DB_HOST,
    dbMaxConnections: process.env.PROD_MAX_CONNECTIONS
};

export default production;