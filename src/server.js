//importaciones
import express from "express";
import session from "express-session";
import handlebars from "express-handlebars";
import { dirname } from "path";
import {fileURLToPath} from "url";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local"; //estrategia para autenticar por correo y password.
import bcrypt from "bcrypt"; //encriptar las contrase;as
import mongoose from "mongoose"; //db usuarios
import MongoStore from "connect-mongo"; //store session
import {UserModel} from "./models/user.js";
import { keyValue  } from "./config/config.js";

//conectamos a la base de datos
const mongoUrl = keyValue.mongoUrl.value
let userLogin= ""
let errorMessage = ""

mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology:true
},(error)=>{
    if(error) return console.log(`Hubo un error de conexión a la base ${error}`);
    console.log("conexión a la base de datos de manera exitosa")
});

//servidor express
const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Server listening on port ${PORT}`));


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


//interpretación de formato json desde el cliente
app.use(express.json()); //lectura de json desde el cuerpo de la petición.
app.use(express.urlencoded({extended:true})); //lectura de json desde un método post de formulario

//configuración de la sesión
app.use(session({
    //definimos el session store
    store: MongoStore.create({
        mongoUrl: mongoUrl
    }),
    secret:"claveSecreta", //clave de encriptacion de la sesion

    //config para guardar en la memoria del servidor
    resave:false,
    saveUninitialized:false,
}));

//configurar passport
app.use(passport.initialize()); //conectamos a passport con express.
app.use(passport.session());//vinculación entre passport y las sesiones de nuestros usuarios.

//serializar un usuario
passport.serializeUser((user,done)=>{
    done(null, user.id)
});

//deserializar al usuario
passport.deserializeUser((id,done)=>{
    //validar si el usuario existe en db.
    UserModel.findById(id,(err, userFound)=>{
       return done(err, userFound)
    })
});

//crear una funcion para encriptar la contrase;
// estaesmiPass => ahjsgduyqwte234296124ahsd-hash
const createHash = (password)=>{
    const hash = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
    return hash;
}

//estrategia de registro utilizando passport local.
passport.use("signupStrategy", new LocalStrategy(
    {
        usernameField: "email",
        passwordFild:'password',
        passReqToCallback:true
    },
    (req,username,password,done)=>{
        //logica para registrar al usuario
        //verificar si el usuario exitse en db
        UserModel.findOne({username:username},(error,userFound)=>{

            if(error) return done(error,null,{message:"Hubo un error"});
            if(userFound) return done(null,null,{message:"El usuario ya existe"});

            //guardamos el usuario en la db
            const newUser={
                name:req.body.name,
                username:username,
                password:createHash(password)
            };
            UserModel.create(newUser,(error,userCreated)=>{
                if(error) return done(error, null, {message:"Hubo un error al registrar el usuario"})
                return done(null,userCreated);
            })
        })
    }
));

passport.use("Local", new LocalStrategy(
    {
        passReqToCallback:true,
        usernameField: "email",
        passwordFild:'password',
    },
    (req,username,password,done)=>{
        errorMessage = ""
        //logica para registrar al usuario
        //verificar si el usuario exitse en db
        UserModel.findOne({username:username},(error,userFound)=>{
        if(error) {
            errorMessage = "Hubo un error"
            return done(error,null,{message:"Hubo un error"});
        }
            
        if(!userFound) 
    	{
            errorMessage = "El usuario no existe"
            return done(null,null,{message:"El usuario no existe"});
        }        
            
        bcrypt.compare(req.body.password, userFound.password, (err, matches) => {
            if (!matches || err) {
                errorMessage = "Hubo un error al loguear el usuario"
                return done(error, null, {message:"Hubo un error al loguear el usuario"})
            }
            else {
                userLogin = userFound.name;
                return done(null,userFound);
            }
        })
      })
    }
));


//rutas asociadas a las paginas del sitio web
app.get("/",(req,res)=>{
    const result = (userLogin === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : userLogin })
});

app.get("/registro",(req,res)=>{
    const errorMessage = req.session.messages ? req.session.messages[0] : '';
    res.render("signup", {error:errorMessage});
    req.session.messages = [];
});

app.get("/inicio-sesion",(req,res)=>{
    res.render("login", {error:errorMessage})
    //const result = (errorMessage === "")  ? res.render("login",{error : ""}) : res.render("login",{error : errorMessage })
    errorMessage=""
});

app.get("/perfil",(req,res)=>{
    console.log(req.session)
    if(req.isAuthenticated()){
        res.render("profile");
    } else{
        res.send("<div>Debes <a href='/inicio-sesión'>inciar sesión</a> o <a href='/registro'>Registrarte</a></div>")
    }
});

//ruta de autenticación registro
app.post("/signup",passport.authenticate("signupStrategy",{
    failureRedirect:"/registro",
    failureMessage: true 
}),(req,res)=>{
    res.redirect("/perfil")
});

//ruta de autenticación login
    app.post("/login", passport.authenticate('Local',{ 
        failureRedirect: '/inicio-sesion', 
        failureMessage:true,        
    }),(req, res)=>{
        const result = (userLogin === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : userLogin })
        res.redirect("/")
    });

//ruta de logout con passport

app.get("/logout",(req,res)=>{
    const result = (userLogin === undefined)  ? res.render("logout",{users : ""}) : res.render("logout",{users : userLogin })
    userLogin="";
    errorMessage="";
    req.session.destroy();
}); 