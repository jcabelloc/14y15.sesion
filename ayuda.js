const sum = (a, b) => {
    if (a && b) {
        return a + b;
    }
    throw new Error('Los valores son invalidos')
}
try {
    console.log(sum(4));
    console.log('Ejecucion conforme')
} catch(error) {
    // console.log("No se pudo procesar la operacion por: ", error.message)
    throw new Error('No se pudo procesar la operacion por: ' + error.message)
}

