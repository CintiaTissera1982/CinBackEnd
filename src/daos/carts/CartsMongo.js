import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class CarritosDaoMongo extends ContenedorMongo{
    constructor(cartModel,sequenceModel,sequenceType){
        super(cartModel,sequenceModel,sequenceType)
    }
}

export {CarritosDaoMongo}