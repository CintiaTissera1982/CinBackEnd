import log4js from "log4js";

//configuracion de la libreria
//definir donde vamos a almacenar los mensajes, y con que nivel los vamos a mostrar
log4js.configure({
    //definir salida de datos: como se almacena y muestran los mensajes
    appenders:{
        consola:{type:"console"},//muestra mensajes por consola
        errorFile:{type:"file",filename:"./src/logs/errores.log"},
        //definir una salida con un nivel en especifico
        consolaDebug:{type:'logLevelFilter',appender:'consola', level:'debug'},
        consolaErrores:{type:'logLevelFilter',appender:'consola', level:'error'},
        archivoErrores:{type:'logLevelFilter', appender:'errorFile', level:'error'}
    },
    categories:{
        default:{appenders:['consolaDebug','archivoErrores'],level:'all'},
        // prodCategory:{appenders:['archivoErrores'],level:'all'},
    }
});

export const logger = log4js.getLogger();//categoria default.