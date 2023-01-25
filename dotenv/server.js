import parsedArgs from "minimist";
import express from "express";
import {config} from "./config.js";
import { RandomFunc } from "./helpers/operaciones.js";
import {fork} from "child_process";

const app = express();


const options = {default:{p:8080}, alias:{p:"puerto"}}
const objArguments = parsedArgs(process.argv.slice(2), options);
const puerto =objArguments.puerto;

app.listen(puerto,()=>console.log(`server listening on port ${puerto}`));

console.log(`Servidor ejecutando la base de datos ${config.BASE_DE_DATOS} en el puerto ${puerto} en el modo ${config.MODO}`);


app.get("/info",(req,res)=>{

    res.send({
      
        //  argumentos:process.argv,
       plataforma: process.platform, //Nombre de la plataforma (sistema operativo) 
       Processid: process.pid, // Process id
       PathEjecución: process.execPath, //Path de ejecución
       Node: process.version, //Versión de node.js
       Argumentos: objArguments, //Argumentos de entrada 
       Carpeta: process.cwd(),//Carpeta del proyecto
       Memoria: process.memoryUsage()//Memoria total reservada (rss)  
     }
)

});

app.get("/api/randoms/:cant?",(req,res)=>{

 const cant = req.params.cant  || 1e+8
 console.log(cant)

 const resultado = RandomFunc(parseInt(cant));
 res.json({resultado:resultado})

});

app.get("/api/randoms-nobloq",(req,res)=>{
  const child = fork("child.js");

    //recibimos mensajes del proceso hijo
    child.on("message",(childMsg)=>{
      if(childMsg === "listo"){
          //recibimos notificacion del proceso hijo, y le mandamos un mensaje para que comience a operar.
          child.send("Iniciar")
      } else {
          res.json({resultado:childMsg})
      }
  });
});