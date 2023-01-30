import pino from "pino";
import { envConfig } from "./envConfig.js";

//configuracion pino
//const prodLogger = pino('./src/logs/errores.log');


const prodLogger = pino('./src/logs/errores.log');

prodLogger.level = "warn";

const devLogger = pino();
//const devLogger = pino("../src/logs/info.log");
devLogger.level='info';

let logger=null;

if(envConfig.NODE_ENV === "prod"){
    logger = prodLogger;
} else {
    logger = devLogger
};

export {logger};