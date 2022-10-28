import { Router  } from 'express';
import { Products } from '../components/Products.js'


const router = Router()
const products = new Products('./Productos.txt')

router.get('/', async(req, res)=>{
    res.render('home')    
})

router.get('/productos', async(req, res)=>{
    const productAll = await products.getAll()
    res.render('products',{products : productAll})    
})


router.post('/productos',async(req,res) =>{
    const newProduct = req.body
    const productos = await products.save(newProduct)
    console.log(await products.getAll())
    res.redirect('/')
    

})

export {router}