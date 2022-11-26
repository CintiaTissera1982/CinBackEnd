import mongoose, { mongo, now } from "mongoose"; 
import { options} from "../config/databaseConfig.js"

 
mongoose.connect(options.mongoDB.URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}, error=>{
    if(error) throw new Error(`conexion fallida ${error}`);
    console.log("conexion exitosa")
})

class ContenedorMongo{
    constructor(model,sequenceModel,sequenceType){
        this.model = model;
        this.sequenceModel = sequenceModel;
        this.sequenceType = sequenceType

    }

    async getSequenceID(){

        let count = await this.sequenceModel.count({id:this.sequenceType});
       
        let newSequence

        if (count === 0) {
            let result = await this.sequenceModel.insertMany( {id:this.sequenceType , seq : 1 },{new:true} );
            return 1

        }else{
            let seq = await this.sequenceModel.find({id:this.sequenceType})
            let seqNew = seq[0].seq + 1 
            newSequence = await this.sequenceModel.updateOne({id: this.sequenceType},{$set:{seq: seqNew}});
            let seqNew2 = await this.sequenceModel.find({id: this.sequenceType})
            return seqNew2[0].seq
        }
    }

    async save(product){
        try {

            console.log(this.model) 
            let id = await this.getSequenceID()
            let newProduct = {id, ...product}
            console.log(JSON.stringify(newProduct))
            let result = await this.model.insertMany(newProduct,{new:true});
            console.log(result);
            return `new product saved with id: ${result[0]._id}`
        } catch (error) {
            return {message:`Error al guardar: ${error}`};
        }
    }

    async getAll(){
        try {
            let results = await this.model.find({})
            return results;
        } catch (error) {
            return [];
        }
    }

    async getById(id){
        try {
            console.log(`id: ${id}`)
            let results = await this.model.find({id: id})
            return results;
        } catch (error) {
            return [];
        }
    }

    async updateById(body, id){
        try {
           console.log(body)
           let ProductUpdate = await this.model.updateOne({id: parseInt(id)},{$set:{...body}}); 

            return {message:"Update successfully"}
        } catch (error) {
            return {message:`Error al actualizar: no se encontró el id ${id}`};
        }
    }

    async deleteById(id){
        try {
            const result = await this.getById(id)
            if(result === 0){
                return {message:`Error al borrar: No se encontro el id: ${id}`};
            } else{
                let ProductDelete = await this.model.deleteOne({id: parseInt(id)});
                return {message:"delete successfully"};
            }
        } catch (error) {
            return {message:`Error al borrar: no se encontró el id ${id}`};
        }
    }

}

export {ContenedorMongo}