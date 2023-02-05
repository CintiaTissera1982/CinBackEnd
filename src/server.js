import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import { logger } from "./loggers/logger.js";
import {options} from "./config/databaseConfig.js";
import { cartsRouter } from "./routes/carritos.js";
import { productsRouter } from "./routes/products.js";
import {authRouter} from "./routes/auth.js";

////////////////////////////
////////////////////////////
///////////////////////////
// Nota:PARA EJECUTAR ESTE CODIGO DEBES AGREGAR LA URL DE LA BASE DE DATOS EN EL ARCHIVO
// src/config/databaseConfig.js

// instancia servidor express
const app = express();

// configuracion servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//configuracion se la sesion
app.use(session({
    //donde se guardan las sesiones
    store: MongoStore.create({
        mongoUrl:options.mongoDB.mongoUrl
    }),
    secret:"claveSecreta",
    resave:false,
    saveUninitialized:false
}));

//confiugracion passport
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use("/api/auth", authRouter);
app.use('/api/productos', productsRouter);
app.use('/api/carritos', cartsRouter);

// Ejecucion del servidor
const PORT = 8080;
const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
})
server.on('error', error => logger.fatal(`Error in server ${error}`));
