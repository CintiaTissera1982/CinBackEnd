import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class ProductosDaoMongo extends ContenedorMongo{
    constructor(productModel,sequenceModel,sequenceType){
        super(productModel,sequenceModel,sequenceType)
    }
}

export {ProductosDaoMongo}