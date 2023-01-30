const path = require("path");

const options = {
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
        }
    },

    facebook: {
        id: "452373743572288",
        secret:"065c9b44cc12c7580c9284f136f5e0a7"

    }


}

module.exports = options;