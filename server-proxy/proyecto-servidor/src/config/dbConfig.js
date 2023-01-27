import path from "path";
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbOptions = {
    mariaDB:{
        client:"mysql",
        connection:{
            host:"127.0.0.1",
            user:"root",
            password:"",
            database:"coderbase"
        }
    },
    sqliteDB:{
        client:"sqlite3",
        connection:{
            filename: path.join(__dirname, "../DB/ecommerce.sqlite")            
        },
        useNullAsDefault:true
    },
    mongoDBAtlas:{
        mongoUrl:"mongodb+srv://ommi:1234@ommidistribuidora.xof6nfa.mongodb.net/ecommerce?retryWrites=true&w=majority"
    }
}
