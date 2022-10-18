import express from 'express'
import {router} from './src/routes/index.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))


/* app.set('view', 'ejs' )
app.set('views', './src/views')
 */

app.set("views", "./src/views");
app.set("view engine", "ejs");
app.use(express.static('public'))



app.use('/', router)

app.listen(8080, () => console.log("Servidor iniciado en puerto 8080"))