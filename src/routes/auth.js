import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import {Strategy as LocalStrategy} from "passport-local";
import { UserModel } from "../models/user.models.js";
import { logger } from "../loggers/logger.js";
import { checkLogin } from "../middlewares/checkLogin.js";

//serializar y deserializar al usuario
passport.serializeUser((user,done)=>{
    return done(null,user.id)
}); //req.session.passport.user={idUsuario}

passport.deserializeUser((id,done)=>{
    UserModel.findById(id,(error,userFound)=>{
        return done(error, userFound)
    })
});//gracias a esta serializacion se produce lo siguiente req.user = userFound.


const createHash = (password)=>{
    const hash = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
    return hash;
};

//estrategia de registro utilizando passport local.
passport.use("signupStrategy", new LocalStrategy(
    {
        passReqToCallback:true,
        usernameField: "email"
    },
    (req,username,password,done)=>{
         logger.info(req.body,username,password)
        //logica para registrar al usuario
        //verificar si el usuario existe en db
        UserModel.findOne({email:username},(error,userFound)=>{
            if(error) return done(null,null,{message:`Hubo un error ${error}`});
            if(userFound) return done(null,null,{message:"El usuario ya existe"});
            //guardamos el usuario en la db
            const newUser={
                email:req.body.email,
                password:createHash(password),
                nombre:req.body.nombre,
                direccion:req.body.direccion,
                edad:req.body.edad,
                telefono:req.body.telefono,
                fotoUrl:req.body.fotoUrl
            };
            // console.log(newUser)
            UserModel.create(newUser,(error,userCreated)=>{
                if(error) return done(null, null, {message:`hubo un error al registrar el usuario ${error}`})
                return done(null,userCreated, {message:"Usuario registrado exitosamente"});
            })
        })
    }
));


const authRouter = express.Router();

authRouter.post("/registro",(req,res)=>{
    passport.authenticate("signupStrategy",(error, user, info)=>{
        if(error || !user) return res.json({message:info.message});
        //si el usuario se crea en la base de datos, vamos a logear al usuario para activarle una sesion a ese usuario
        req.logIn(user,function(error){
            if(error) return res.json({message:"hubo un error al autenticar al usuario"});
            res.json({user,message:info.message})
        })
    })(req,res)//poder utilizar en el callback el req, y el res
});

authRouter.get("/home",checkLogin,(req,res)=>{
    console.log(req);
    res.send("pagina del home");
});

authRouter.post("/logout",(req,res)=>{
    req.logOut((error)=>{
        if(error) return res.status(400).json({message:"Error al cerrar sesion"});
        res.status(200).json({message:"Sesion finalizada"})
    })
})

export {authRouter};