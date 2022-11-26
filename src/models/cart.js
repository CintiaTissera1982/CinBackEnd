import mongoose from "mongoose";

//definir la collecion
const cartCollection = "carritos";

//definir el esquema
const cartSchema = new mongoose.Schema({
    
    id: {
        type: Number    
    },
    timestamp: {
        type: String
    }, 
    productos:[{

        id: {
            type: Number    
        },
        timestamp: {
            type: Date
        }, 
        nombre:{
            type: String
        },
        descripcion:{
            type:String
        },
        codigo:{
            type:Number
        },
        url:{
            type:String
        },
        precio:{
            type:Number
        },
        stock:{
            type:Number
        }
    }]
})

//generamos el modelo
export const cartModel = mongoose.model(cartCollection, cartSchema);