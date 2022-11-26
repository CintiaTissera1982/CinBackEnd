import mongoose from "mongoose";

//definir la collecion
const productCollection = "productos";

//definir el esquema
const productSchema = new mongoose.Schema({
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

})

//generamos el modelo
export const productModel = mongoose.model(productCollection, productSchema);