import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @param {String} key
 * @returns {String}
*/
const getValue =  (key, throwMissingError = true) => {
    const env = process.env;
    const value = env[key];
    if (!value && throwMissingError) {
        throw new Error(`config error - env.${key} does not exist`);
    }

  return value;
}

const config =  (nodeEnv, envTag) => ({
	isDev: nodeEnv === 'development',
	isStaging: nodeEnv === 'staging',
	isProduction: nodeEnv === 'production',
	isTest: nodeEnv === 'test',
	// DB configuration
	dbPassword: getValue("POSTGRES_PASSWORD"),
	dbUsername: getValue("POSTGRES_USER"),
	dbName: getValue("POSTGRES_DATABASE"),
	dbPort: getValue("POSTGRES_PORT"),
	dbHost: getValue("POSTGRES_HOST"),
	dbMaxConnections:  getValue("POSTGRES_MAX_CONNECTIONS"),
	// app configuration
	appEnvironment: getValue(`NODE_ENV`),
});

const setupConfig = () => {
	const nodeEnv = getValue('NODE_ENV');
	let envTag;
	if (nodeEnv === "production") {
		envTag = 'PROD';
	} else if (nodeEnv === "staging") {
		envTag = 'STAGING';
	} else if (nodeEnv === "test") {
		envTag = 'TEST';
	} else {
		envTag = 'DEV';
	}  
	return config(nodeEnv, envTag);
}

export default setupConfig();
