import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import handlebars from "express-handlebars";
import {Server} from "socket.io";
import path from "path";
import {fileURLToPath} from 'url';
import parseArgs from "minimist";
import cluster from "cluster";
import os from "os";

import { dbOptions } from "./config/dbConfig.js";
import { productRouter } from "./routes/api/products.js";
import { clientRouter } from "./routes/web/clientRoutes.js";
import { authRouter } from "./routes/web/authRoutes.js";
import { productsSocket } from "./routes/ws/products.js";
import { chatSocket } from "./routes/ws/chat.js";

//const __dirname = path.dirname(fileURLToPath(import.meta.url));

//captura argumentos
const options = {alias:{m:"mode", p:"port"}, default:{mode:"FORK", port:8080}};
const objArguments = parseArgs(process.argv.slice(2), options);
const MODO = objArguments.mode;
const PORT = objArguments.port;
//console.log("modo",MODO, "port", PORT);


//Express server config
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

//Configuracion template engine handlebars
app.engine(".hbs",handlebars.engine({extname: '.hbs'}));
app.set('views', './src/views');
app.set("view engine", ".hbs");

//Configuración de la sesión
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: dbOptions.mongoDBAtlas.mongoUrl
    }),
    secret:"ClaveSecreta",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 60000 //10min
    }
}));

// Server routes
// Api routes
app.use('/api/productos',productRouter);
//view routes
app.use(clientRouter);
app.use(authRouter);





//Express server
//cluster.isPrimary Proceso principal q ejecuta la app
if(MODO === "CLUSTER" && cluster.isPrimary) {
    console.log("modo cluster")
    const numCPUS = os.cpus().length; //numero de nucleos del procesador
    for(let i=0; i<numCPUS;i++){
        cluster.fork(); //creamos los subprocesos
    }

    cluster.on("exit",(worker)=>{
        console.log(`El subproceso ${worker.process.pid} falló`);
        cluster.fork();
    });

} else{
    const server = app.listen(PORT,()=>{
        console.log(`listening on port ${PORT} on process ${process.pid}`);
    });

    //Websocket server
    const io = new Server(server);
    //configuracion websocket
    io.on("connection",async(socket)=>{
        // console.log('Nuevo cliente conectado!');
        //PRODUCTOS
        productsSocket(socket, io.sockets);
        //CHAT
        chatSocket(socket, io.sockets);
    });
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