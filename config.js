require('dotenv').config();

let environments = {};

environments.development = {
    https : 'http',
    HOST : '0.0.0.0',
    PORT : 3000,
    DB : process.env.DB_URL_DEV 
}
environments.test = {
    https : 'https',
    HOST : process.env.HOST_DEV,
    PORT : process.env.PORT_DEV,
    DB : process.env.DB_URL_DEV, 
    key : process.env.SSL_DIRECTORY + "server-test.ssl.d/test.paceful.org.key",
    cert : process.env.SSL_DIRECTORY + "server-test.ssl.d/test.paceful.org.crt"
}
environments.production = {
    https : 'https',
    HOST : process.env.HOST_PROD,
    PORT : process.env.PORT_PROD,
    DB : process.env.DB_URL_PROD, 
    key: process.env.SSL_DIRECTORY +  "server.ssl.d/server.paceful.org.key",
    cert: process.env.SSL_DIRECTORY + "server.ssl.d/server.paceful.org.crt"
}



const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.test;

module.exports = environmentToExport;
