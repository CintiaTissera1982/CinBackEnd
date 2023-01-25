import { RandomFunc } from "./helpers/operaciones.js";

//solo cuando trabajemos con modulos de es6
process.send("listo"); //proceso hijo listo para trabajar

////recibimos los mensajes del proceso padre.
process.on("message",(parentMsg)=>{
    if(parentMsg === "Iniciar"){
        const resultado = RandomFunc(5e+8);
        //enviamos el resultado de la operación del proceso hijo al proceso padre
        process.send(resultado);
    }
})