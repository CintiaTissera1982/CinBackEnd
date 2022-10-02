let productos = []
let ProductoAleatorio = []

const fs = require("fs");

class Contenedor{
    constructor(nameFile){
        this.nameFile = nameFile;
    }

    getById = (id)=>{
        try {
            if(fs.existsSync(this.nameFile)){
                const contenido =  fs.readFileSync(this.nameFile,"utf8");
                if(contenido){
                    const productos = JSON.parse(contenido);
                    const producto = productos.find(item=>item.id===id);
                    return producto
                } else{
                    return "El archivo esta vacio"
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    getAll = ()=>{
        try {
            const contenido =  fs.readFileSync(this.nameFile,"utf8");
            const productos = JSON.parse(contenido);
            return productos
        } catch (error) {
            console.log(error)
        }
    }

}


const listaProductos = new Contenedor("./Productos.txt")

const getProduct = ()=>{
    productos = listaProductos.getAll();    
    console.log(productos)            

} 

const getProductByID = ()=>{
    const numeroAleatorio = parseInt(Math.random()*4);
    
     //se realiza dentro de un if la llamada ya que por el momento solo cuento con esa cantidad de productos como prueba
     if (numeroAleatorio > 0 && numeroAleatorio < 4) {
        ProductoAleatorio = listaProductos.getById(numeroAleatorio);
        console.log(ProductoAleatorio)         
            
    } 
}


const express = require("express");

//crear el servidor
const app = express();

app.get("/productos", (req,res)=>{
    getProduct()
    res.send(productos)
  })

app.get("/productoRandom", (req,res)=>{
    getProductByID()
    res.send(ProductoAleatorio) 
})

//levantar el servidor
app.listen(8080,()=>{
    console.log("server listening on port 8080")
})

