//creamos el socket del cliente.
const socketClient = io();

//captura el valor del usuario
let user;
Swal.fire({
    title:"Hola usuario",
    text:"bienvenido, ingresa tu usuario",
    input:"text",
    allowOutsideClick:false
}).then(respuesta=>{
    user = respuesta.value;
});

//guardar un producto desde el cliente
const productForm = document.getElementById("productForm");
productForm.addEventListener("submit",(evt)=>{
    //prevenir comportamientos por defecto no deseados del formulario
    evt.preventDefault();
    const product ={
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    }
    //enviamos el nuevo producto al servidor.
    socketClient.emit("newProduct",product);
})


//productos en tiempo real
//crear un tabla en html basado en los datos, y en el template de handlebars
const createTable = async(data)=>{
    const response = await fetch("./templates/table.handlebars");
    const result = await response.text();
    const template = Handlebars.compile(result);
    const html = template({products:data});
    return html;
}

const productsContainer = document.getElementById("productsContainer");
socketClient.on("products",async(data)=>{
    //generar el html basado en la plantilla de hbs con todos los productos
    const htmlProducts = await createTable(data);
    productsContainer.innerHTML = htmlProducts;
})


const email = document.getElementById("email")
const messageField = document.getElementById("messageField")
// crea un nuevo objeto `Date`
let today = new Date();
// obtener la fecha y la hora
let now = today.toLocaleString();

let  validEmail =  /^\w+([._+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

const Validate = () => {   
    if (email.value === "") {
        Swal.fire({
            title: 'Advertencia!',
            text: '"Email vacio"',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        })
        return false;

    }else{               
        if (validEmail.test(email.value)){
            return true;
           } else {
            Swal.fire({
                title: 'Advertencia!',
                text: '"La dirección de email es incorrecta."',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            })
            return false;
        }        
    }
}

sendMessage.addEventListener("click", ()=> {

    if(Validate()){
        socketClient.emit("message",{
            username:email.value, //+ '[' + now + ']',
            date:' [' + now + ']',
            message:messageField.value
        })
        messageField.value ="";
    }

})

//mostrar los mensajes cuando el usuario carga la página
const messageContainer = document.getElementById("messageContainer");
socketClient.on("historico",(data)=>{
    let elementos="";
    data.forEach(item=>{
       // elementos = elementos + `<p style="color: blue"><strong>${item.username}</strong>: ${item.message}</p>`;

        elementos = elementos + `<div style= "display:flex;flex-direction: row"><p style="color: blue; margin: 10px"><strong>${item.username}</strong> </p> <p style= "color: brown; margin: 10px"> ${item.date}</p> <p style= "color: green; font-style: italic; margin: 10px"> ${item.message}</p></div>`;

    });
    messageContainer.innerHTML = elementos;
})