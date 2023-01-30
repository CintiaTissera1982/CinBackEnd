import express from 'express';
import cluster from 'cluster';
import { cpus } from 'os';
import compression from "compression";
import { logger } from "./logger.js";

//scripts consigna 2 -profiler 
//curl -X GET "http://localhost:8081/info"
//node --prof src/server.js

//artillery quick --count 50 -n 40 http://localhost:8081/info > result_bloq.txt

const PORT = parseInt(process.argv[2]) || 8080
const modoCluster = process.argv[3] == 'CLUSTER';
//const app = express()

const app = express()


if (modoCluster && cluster.isPrimary) {
    const numCPUs = cpus().length

    console.log(`Número de procesadores: ${numCPUs}`)
    console.log(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString())
        cluster.fork()
    })
} else {
    //const app = express()

/*     app.get('/', (req, res) => {
        const primes = []
        const max = Number(req.query.max) || 1000
        for (let i = 1; i <= max; i++) {
            if (isPrime(i)) primes.push(i)
        }
        res.json(primes)
    }) */

    app.listen(PORT, err => {
        if (!err) console.log(`Servidor express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`)
    })
}

function isPrime(num) {
    if ([2, 3].includes(num)) return true;
    else if ([2, 3].some(n => num % n == 0)) return false;
    else {
        let i = 5, w = 2;
        while ((i ** 2) <= num) {
            if (num % i == 0) return false
            i += w
            w = 6 - w
        }
    }
    return true
}

 


app.get("/info",(req,res)=>{

    res.send({
      
        //  argumentos:process.argv,
       plataforma: process.platform, //Nombre de la plataforma (sistema operativo) 
       Processid: process.pid, // Process id
       PathEjecución: process.execPath, //Path de ejecución
       Node: process.version, //Versión de node.js
       Argumentos: objArguments, //Argumentos de entrada 
       Carpeta: process.cwd(),//Carpeta del proyecto
       Memoria: process.memoryUsage(),//Memoria total reservada (rss)  
       NumeroProcesadores: os.cpus().length

     }
)
});



app.get("/infoZip",compression(),(req,res)=>{

    res.send({
      
        //  argumentos:process.argv,
       plataforma: process.platform, //Nombre de la plataforma (sistema operativo) 
       Processid: process.pid, // Process id
       PathEjecución: process.execPath, //Path de ejecución
       Node: process.version, //Versión de node.js
       Argumentos: objArguments, //Argumentos de entrada 
       Carpeta: process.cwd(),//Carpeta del proyecto
       Memoria: process.memoryUsage(),//Memoria total reservada (rss)  
       NumeroProcesadores: os.cpus().length

     }
)
});


//logueo
app.get("/sumar", (req,res)=>{
    const {num1, num2}= req.query;
    if(!num1 || !num2){
        logger.error("El usuario no ingreso los numeros");
        res.send("Por favor ingresa los números");
    } else if(!Number.isInteger(parseInt(num1)) || !Number.isInteger(parseInt(num2))){
        logger.warn("Datos incorrectos");
        res.send("Datos incorrectos");
    } else{
        logger.info("La suma fue realizada correctamente")
        res.send(`la suma es ${parseInt(num1) + parseInt(num2)}`);
    }
}); 