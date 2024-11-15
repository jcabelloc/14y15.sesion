const { default: mongoose } = require('mongoose');
const Producto = require('../models/producto');
const { validationResult } = require('express-validator');
const file = require('../utils/file')

exports.getCrearProducto = (req, res) => {
    res.render('admin/editar-producto', {
        titulo: 'Crear Producto',
        path: '/admin/crear-producto',
        modoEdicion: false,
        autenticado: req.session.autenticado,
        mensajeError: null,
        tieneError: false,
        erroresValidacion: []
    })
};

exports.postCrearProducto = (req, res, next) => {
    const nombre = req.body.nombre;
    //const urlImagen = req.body.urlImagen;
    const imagen = req.file;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;

    if (!imagen) {
        return res.status(422).render('admin/editar-producto', {
            path: '/admin/editar-producto',
            titulo: 'Crear Producto',
            modoEdicion: false,
            tieneError: true,
            mensajeError: 'No hay imagen de Producto',
            erroresValidacion: [],
            producto: {
                nombre: nombre,
                precio: precio,
                descripcion: descripcion
            },
        });

    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editar-producto', {
            path: '/admin/editar-producto',
            titulo: 'Crear Producto',
            modoEdicion: false,
            tieneError: true,
            mensajeError: errors.array()[0].msg,
            erroresValidacion: errors.array(),
            producto: {
                nombre: nombre,
                precio: precio,
                descripcion: descripcion
            },
        });
    }
    const urlImagen = imagen.path;

    const producto = new Producto({
        // _id: new mongoose.Types.ObjectId('672c1d0333c24b7bc6512672'),
        nombre: nombre,
        precio: precio,
        descripcion: descripcion,
        urlImagen: urlImagen,
        idUsuario: req.usuario._id
    });
    producto.save()
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditarProducto = (req, res, next) => {
    const modoEdicion = req.query.editar;
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return res.redirect('admin/productos');
            }
            res.render('admin/editar-producto', {
                titulo: 'Editar Producto',
                path: '/admin/editar-producto',
                producto: producto,
                modoEdicion: true,
                autenticado: req.session.autenticado,
                mensajeError: null,
                tieneError: false,
                erroresValidacion: []
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.postEditarProducto = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    // const urlImagen = req.body.urlImagen;
    const imagen = req.file;
    const descripcion = req.body.descripcion;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editar-producto', {
            path: '/admin/editar-producto',
            titulo: 'Editar Producto',
            modoEdicion: true,
            tieneError: true,
            mensajeError: errors.array()[0].msg,
            erroresValidacion: errors.array(),
            producto: {
                nombre: nombre,
                precio: precio,
                descripcion: descripcion,
                _id: idProducto
            },
        });
    }

    Producto.findById(idProducto)
        .then(producto => {
            if (producto.idUsuario.toString() !== req.usuario._id.toString()) {
                return res.redirect('/');
            }
            producto.nombre = nombre;
            producto.precio = precio;
            producto.descripcion = descripcion;
            if (imagen) {
                file.deleteFile(producto.urlImagen);
                producto.urlImagen = imagen.path;
            }
            return producto.save();
        })
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};



exports.getProductos = (req, res, next) => {
    //Producto.find()
    Producto.find({ idUsuario: req.idUsuario})
        .then(productos => {
            res
                .status(200)
                .json(
                    {
                        prods: productos,
                        mensaje: 'Se proceso con exito'
                    }
                )
            /*
            res.render('admin/productos', {
                prods: productos,
                titulo: "Administracion de Productos",
                path: "/admin/productos",
                autenticado: req.session.autenticado
            });*/
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        });
};


exports.postEliminarProducto = (req, res, next) => {
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return next(new Error('Producto no se ha encontrado'));
            }
            file.deleteFile(producto.urlImagen);
            return Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
        })
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};




exports.deleteProducto = (req, res, next) => {
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return next(new Error('Producto no encontrado'));
            }
            file.deleteFile(producto.urlImagen);
            return Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
        })
        .then(() => {
            console.log('PRODUCTO ELIMINADO');
            res.status(200).json({ message: 'Exitoso' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Eliminacion del producto fallo' });
        });
};

