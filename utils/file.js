const fs = require('fs')

const deleteFile = (rutaArchivo) => {
    fs.unlink(rutaArchivo, (err) => {
        if (err) {
            throw (err);
        }
    })
}

exports.deleteFile = deleteFile