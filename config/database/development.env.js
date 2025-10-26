import * as dotenv from 'dotenv'
dotenv.config()

const development = {
    dbPassword: process.env.DEV_DB_PASSWORD,
    dbUsername: process.env.DEV_DB_USER,
    dbName: process.env.DEV_DB_NAME,
    dbPort: process.env.DEV_DB_PORT,
    dbHost: process.env.DEV_DB_HOST,
    dbMaxConnections: process.env.DEV_MAX_CONNECTIONS
};

export default development;
