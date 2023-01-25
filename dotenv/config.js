import * as dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "dev" ? ".env.development" : ".env.production";

dotenv.config({
    path:envFile
});

//creamos la configuración de nuestra aplicación
export const config = {
    //PORT: process.env.PORT || 8000,
    MODO: process.env.MODO || "Testing",
    BASE_DE_DATOS: process.env.BASE_DE_DATOS || "",
    LANGUAGE: process.env.LANGUAGE || "English"
};