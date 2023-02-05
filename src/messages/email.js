import {createTransport} from "nodemailer";

//crendeicales del admin
export const emailAdmin = "peque.82@gmail.com";
const passAdmin = "jjfxuxgfpueefiuz";

//configurar nodemailer
export const transporterEmail = createTransport({
    host:"smtp.gmail.com",
    port:587,
    auth:{
        user:emailAdmin,
        pass:passAdmin
    },
    secure:false,
    tls:{
        rejectUnauthorized:false
    }
});
