//importaciones
import express from "express";
import session from "express-session";
import handlebars from "express-handlebars";
import { dirname } from "path";
import {fileURLToPath} from "url";

import MongoStore from "connect-mongo";


//servidor express
const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Server listening on port ${PORT}`));


app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://ommi:1234@ommidistribuidora.xof6nfa.mongodb.net/ecommerce?retryWrites=true&w=majority"
    }),
    secret:"claveSecreta",
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge:600000
    }
}));


//archivos estaticos
const __dirname = dirname(fileURLToPath(import.meta.url)); //ruta server.js
app.use(express.static(__dirname+"/public"));//ruta carpeta public


//motor de plantilla
//inicializar el motor de plantillas
app.engine(".hbs",handlebars.engine({extname: '.hbs'}));
//ruta de las vistas
app.set("views", __dirname+"/views");
//vinculacion del motor a express
app.set("view engine", ".hbs");


//interpretacion de formato json desde el cliente
app.use(express.json()); //lectura de json desde el cuerpo de la petición.
app.use(express.urlencoded({extended:true})); //lectura de json desde un metodo post de formulario


//configuracion de la sesion
app.use(session({
    secret:"claveSecreta", //clave de encriptación de la sesión

    //config para guardar en la memoria del servidor
    resave:true,
    saveUninitialized:true,
}));


//middleware para validar la sesión del usuario
const checkSession = (req,res,next)=>{
    //validamos si la sesión esta activa
    if(req.session.user){
       const result = (req.session.user === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : req.session.user.name })
    } else{
        next();
    }
}

//rutas asociadas a las páginas del sitio web
app.get("/",(req,res)=>{
    const result = (req.session.user === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : req.session.user.name })
});

app.get("/registro",checkSession,(req,res)=>{
    res.render("signup")
});

app.get("/inicio-sesion",checkSession,(req,res)=>{
    res.render("login")
});

app.get("/perfil",(req,res)=>{
    if(req.session.user){
        res.render("profile");
    } else{
        res.send("<div>Debes <a href'/inicio-sesion'>inciar sesion</a> o <a href='/registro'>registrarte</a></div>")
    }
});

let users = [];

//rutas de autenticacion
app.post("/signup",(req,res)=>{
    const newUser = req.body;
    //el usuario existe?
    const userExists = users.find(elm=>elm.email === newUser.email);
    if(userExists){
        res.render("signup",{error:"usuario ya registrado"});
    } else{
        users.push(newUser);
        req.session.user = newUser;
        const result = (req.session.user === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : req.session.user.name })
    }
});

app.post("/login",(req,res)=>{
    const user = req.body;
    //el usuario existe
    const userExists = users.find(elm=>elm.email === user.email);
    if(userExists){
        //validar la contraseña
        if(userExists.password === user.password){
            req.session.user = user;
            console.log(userExists.name)
            const result = (userExists.name === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : userExists.name })
           // const result = (req.session.user === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : req.session.user.name })
        } else{
            res.redirect("/inicio-sesion")
        }
    } else{
        res.redirect("/registro");
    }
});

app.get("/logout",(req,res)=>{
    const result = (req.session.user === undefined)  ? res.render("logout",{users : ""}) : res.render("logout",{users : req.session.user.name, })
    req.session.destroy();
}); 