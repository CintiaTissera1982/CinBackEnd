import express from "express";
import { options } from "../config/databaseConfig.js";
import { ContenedorArchivo } from "../managers/ContenedorArchivo.js";
import { ContenedorMysql } from "../managers/ContenedorMysql.js";
import {ContenedorDaoProductos, ContenedorDaoCarritos} from "../daos/index.js";

//manager carritos
const productosApi = ContenedorDaoProductos;
const carritosApi = ContenedorDaoCarritos;

//router carritos
const cartsRouter = express.Router();

cartsRouter.get('/', async (req, res) => {
    const response = await carritosApi.getAll();
    res.json(response);
})

cartsRouter.post('/', async (req, res) => {

    console.log("Entramos al POST DE CARRITOS")
    const body = req.body
    const response = await carritosApi.save(body);
    res.json(response);
})

cartsRouter.delete('/:id', async (req, res) => {
    const cartId = parseInt(req.params.id);
    res.json(await carritosApi.deleteById(cartId));
})

cartsRouter.get('/:id/productos', async (req, res) => {
    try{
        const {id} = req.params
        const allObjects = await carritosApi.getById(parseInt(id))
        console.log(allObjects)        

        res.send(allObjects[0].productos)
    }
    catch(error){
        console.log(error)
        res.send({message:'Error al buscar productos', code:-1})
    }

})

cartsRouter.post('/:id/productos', async (req, res) => {
    try{
        
        const {id} = req.params
        const allObjects= await carritosApi.getById(parseInt(id))
        console.log(allObjects)
        const productos = allObjects[0].productos
        console.log('Al obtener todos los productos desde getById '+JSON.stringify(allObjects[0].productos))
        const prodLen = productos.length
        console.log('Long productos: '+prodLen)
        
        productos[prodLen]=req.body
        
        allObjects.productos = productos        
        await carritosApi.updateById(allObjects,id)
        const updatedObject = await carritosApi.getById(parseInt(id))
        res.send(updatedObject)

    }catch{
        console.log('Error al ejecutar addNestedObject')
    }
})

cartsRouter.delete('/:id/productos/:id_prod', async (req, res) => {
    try{
        const{id} = req.params
        const{id_prod}=req.params
        const allObjects=await carritosApi.getById(parseInt(id))
        const productos=allObjects[0].productos
        const newNestedObject = productos.filter(item => item.id !==parseInt(id_prod))
        allObjects[0].productos = newNestedObject
        let newUpdate = {timestamp:allObjects[0].timestamp,productos:allObjects[0].productos}
        console.log('all objects final: '+newUpdate)
        const resp=await carritosApi.updateById(newUpdate,id)

        res.send(resp)

    }catch(error){
        console.log('Error al eliminar un producto del carrito')
    }
})


export {cartsRouter}