const fs = require("fs");
const path = require("path");

class ContenedorChat{
    constructor(nameFile){
        this.nameFile = path.join(__dirname,"..",`files/${nameFile}`);
    }

    save = async(chat)=>{
        try {
            //leer el archivo existe
            if(fs.existsSync(this.nameFile)){
                const chats = await this.getAll();
                const newChat={
                    ...chat
                }
                chats.push(newChat);
                await fs.promises.writeFile(this.nameFile, JSON.stringify(chats, null, 2))
                return chats;
            } else{
                // si el archivo no existe
                const newChat={
                    ...chat
                }
                //creamos el archivo
                await fs.promises.writeFile(this.nameFile, JSON.stringify([newChat], null, 2));
            }
        } catch (error) {
            console.log(error);
        }
    }


    getAll = async()=>{
        if(fs.existsSync(this.nameFile)){
            try {
                const contenido = await fs.promises.readFile(this.nameFile,"utf8");
                const chats = JSON.parse(contenido);               
                return chats
            } catch (error) {
                console.log(error)
            }
        }
        return {status:'error',message:"No hay chats"}
    }

}

module.exports = ContenedorChat;