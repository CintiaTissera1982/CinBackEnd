import mongoose from "mongoose";

//definir la collecion
const sequenceCollection = "sequenceModel";

//definir el esquema
const sequenceSchema = new mongoose.Schema({
    id: {
        type: String
        
    },
    seq: {
        type:Number
    }   
})

//generamos el modelo
export const sequenceModel = mongoose.model(sequenceCollection, sequenceSchema);