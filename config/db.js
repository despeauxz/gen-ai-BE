import pgPromise from "pg-promise";
import promise from "bluebird";
import logger from "./logger";
import { environments } from "../app/enums";
import * as monitor from 'pg-monitor'
import config from './index'

/**
 * The DB class provides an interface for working with the SQL database.
 */
class DB {
    constructor(host, user, port, password, dbName, maxConnections) {
        this.host = host;
        this.user = user;
        this.port = port;
        this.password = password;
        this.dbName = dbName;
        this.maxConnections = maxConnections
    }

    /**
     * Setup the connection to db
     */
    connect() {
        const pgp = pgPromise();
        // const pg = pgp({ promiseLib: promise, noWarnings: false });
        const initOptions = {
            host: this.host,
            user: this.user,
            port: this.port,
            password: this.password,
            database: this.dbName,
            max: this.maxConnections
        }
        const client = pgp(initOptions);
        // monitor.attach(initOptions)

        // const query = client.query;
        // if(config.appEnvironment != environments.PRODUCTION && config.appEnvironment != environments.DEVELOPMENT && config.appEnvironment != environments.TEST){
        //     client.query = async function (text, values) {
        //       const fullQuery = pgp.as.format(text, values);
        //       logger(config.appEnvironment).info(`Query: ${fullQuery}`);
        //       return query.apply(this, arguments);
        //     };
        // }

        client.connect().then(instance => {
            logger(config.appEnvironment).info(`Connected to database: ${instance.client.database}`);
        }).catch(err => (config.appEnvironment != environments.TEST) ? logger(config.appEnvironment).error(err): console.log(err))
        return client;
    }
}

const client = new DB(
    config.dbHost,
    config.dbUsername,
    config.dbPort,
    config.dbPassword,
    config.dbName,
    config.dbMaxConnections
);
const db = client.connect();
export default db;




