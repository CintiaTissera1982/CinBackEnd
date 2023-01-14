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

mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology:true
},(error)=>{
    if(error) return console.log(`Error de conexión a la base ${error}`);
    console.log("conexión a la base de datos exitosa")
});

//servidor express
const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Escuchando servidor en puerto: ${PORT}`));


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
app.use(express.json()); //lectura de json desde el cuerpo de la peticion.
app.use(express.urlencoded({extended:true})); //lectura de json desde un metodo post de formulario

//configuracion de la sesion
app.use(session({
    //definimos el session store
    store: MongoStore.create({
        mongoUrl: mongoUrl
    }),
    secret:"claveSecreta", //clave de encriptaciÓn de la sesion

    //config para guardar en la memoria del servidor
    resave:false,
    saveUninitialized:false,
}));

//configurar passport
app.use(passport.initialize()); //conectamos a passport con express.
app.use(passport.session());//vinculacion entre passport y las sesiones de nuestros usuarios.

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

//crear una función para encriptar la contraseña
const createHash = (password)=>{
    const hash = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
    return hash;
}

const matchPassword = (password, savedPassword)=>{
    return new Promise((resolve, reject) => {
        console.log("llegamos a validar?")
      bcrypt.compare(password, savedPassword, (err, matches) => {
        if (err) reject(err)
        else resolve(matches)
      })
    })
  }


//estrategia de registro utilizando passport local.
passport.use("signupStrategy", new LocalStrategy(
    {
        passReqToCallback:true,
        usernameField: "email"
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

//estrategia de Login utilizando passport local.

passport.use("local",new LocalStrategy({
    usernameFild:'email',
    passwordFild:'password',
    passReqToCallback:true
    // this working
  },async (req,username,password,done)=> {
    console.log("nose si llegamos aca")
    const userFind = await UserModel.findOne({username:username})
    if (userFind) {
        console.log("menos si llegmos aca")
      const validPassword = await matchPassword(toString(password),toString(userFind[0].password))
      console.log("validPassword==>", validPassword)
    }})
);

//rutas asociadas a las paginas del sitio web
/* app.get("/",(req,res)=>{
    res.render("home")
}); */

//rutas asociadas a las páginas del sitio web
app.get("/",(req,res)=>{
    const result = (userLogin === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : userLogin })
});


app.get("/registro",(req,res)=>{
    const errorMessage = req.session.messages ? req.session.messages[0] : '';
    res.render("signup", {error:errorMessage});
    req.session.messages = [];
});

app.get("/inicio-sesion",(req,res)=>{
    const errorMessage = req.session.messages ? req.session.messages[0] : '';
    res.render("login", {error:errorMessage});
    req.session.messages = [];
    req.session.user = req.body.name
});

app.get("/perfil",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("profile");
    } else{
        res.send("<div>Debes <a href='/inicio-sesion'>Iniciar Sesión</a> o <a href='/registro'>Registrarte</a></div>")
    }
});

//rutas de autenticacion registro
app.post("/signup",passport.authenticate("signupStrategy",{
    failureRedirect:"/registro",
    failureMessage: true
}),(req,res)=>{
    res.redirect("/perfil")
});

//ruta de autenticacion login

  app.post("/login", passport.authenticate("local", {
    //si el usuario y pass es correcto redirige a /, si no de regreso a login
    failureRedirect: "/inicio-sesion",
    failureMessage: true
   }), (req, res)=> {
    //vacio por que no se necesita
     const result = (userLogin === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : userLogin })

    res.redirect('/');
   });


//ruta de logout con passport
/* app.get("/logout",(req,res)=>{
    req.logout(err=>{
        console.log("sdsdsds salida")
        if(err) return res.send("Error al cerrar sesión")
        req.session.destroy();
        res.redirect("/")
    });
}); */


app.get("/logout",(req,res)=>{
    const result = (userLogin === undefined)  ? res.render("logout",{users : ""}) : res.render("logout",{users : userLogin })
    req.session.destroy();
}); 