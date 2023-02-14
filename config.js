require('dotenv').config();

let environments = {};

environments.development = {
    HOST : '0.0.0.0',
    PORT : 3000,
    DB : process.env.DB_URL_DEV 
}
environments.test = {
    HOST : process.env.HOST_DEV,
    PORT : process.env.PORT_DEV,
    DB : process.env.DB_URL_DEV 
}
environments.production = {
    HOST : process.env.HOST_PROD,
    PORT : process.env.PORT_PROD,
    DB : process.env.DB_URL_PROD, 
}



const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.test;

module.exports = environmentToExport;
