import * as dotenv from 'dotenv'
dotenv.config()

const test = {
    dbPassword: process.env.TEST_DB_PASSWORD,
    dbUsername: process.env.TEST_DB_USER,
    dbName: process.env.TEST_DB_NAME,
    dbPort: process.env.TEST_DB_PORT,
    dbHost: process.env.TEST_DB_HOST,
    dbMaxConnections: process.env.TEST_MAX_CONNECTIONS
};

export default test;
