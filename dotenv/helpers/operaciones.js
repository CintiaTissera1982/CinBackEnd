export const RandomFunc = (cant)=>{
    const resultados ={};

    console.log("ya estoy en la función")
    console.log(cant)

    for (let index = 0; index < cant; index++) {
        const numeroAleatorio = parseInt(Math.random()*parseInt(cant)+1);
        if(resultados[numeroAleatorio]){
            resultados[numeroAleatorio]++
        } else{
            resultados[numeroAleatorio] = 1;
        }   
    };
    console.log(resultados);
    return resultados;
 
};