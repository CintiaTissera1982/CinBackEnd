//importaciones
import express from "express";
import session from "express-session";
import handlebars from "express-handlebars";
import { dirname } from "path";
import {fileURLToPath} from "url";
import passport from "passport";

import bcrypt from "bcrypt"; //encriptar las contrase;as
import MongoStore from "connect-mongo";
import facebookStrategy  from "passport-facebook" 

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

//configurar passport
app.use(passport.initialize()); //conectamos a passport con express.
app.use(passport.session());//vinculacion entre passport y las sesiones de nuestros usuarios.
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

//middleware para validar la sesión del usuario
const checkSession = (req,res,next)=>{
    //validamos si la sesión esta activa
    if(req.session.user){
       const result = (req.session.user === undefined)  ? res.render("home",{users : ""}) : res.render("home",{users : req.session.user.name })
    } else{
        next();
    }
}


passport.use(new facebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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

//login con facebook
app.get("/login-facebook", passport.authenticate("facebookLogin"));
app.get("/auth/facebook/callback", passport.authenticate("facebookLogin",{
    failureRedirect:"/login",
    failureMessage:true
}),(req,res)=>{
    res.redirect("/perfil")
})


app.get("/logout",(req,res)=>{
    const result = (req.session.user === undefined)  ? res.render("logout",{users : ""}) : res.render("logout",{users : req.session.user.name, })
    req.session.destroy();
}); 