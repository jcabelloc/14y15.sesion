const Producto = require('../models/producto');
const Pedido = require('../models/pedido');

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ITEMS_POR_PAGINA = 2;

exports.getProductos = (req, res, next) => {
    let pagina = +req.query.pagina
    if (!pagina) {
        pagina = 1
    }
    // const pagina = +req.query.pagina || 1;
    let nroProductos;
    Producto.find()
        .countDocuments()
        .then(nroDocs => {
            nroProductos = nroDocs;
            return Producto.find()
                .skip((pagina - 1) * ITEMS_POR_PAGINA)
                .limit(ITEMS_POR_PAGINA);

        })
        .then(productos => {
            res.render('tienda/lista-productos', {
                prods: productos,
                titulo: "Productos de la tienda",
                path: "/productos",
                autenticado: req.session.autenticado,
                paginaActual: pagina,
                tienePaginaSiguiente: ITEMS_POR_PAGINA * pagina < nroProductos,
                tienePaginaAnterior: pagina > 1,
                paginaSiguiente: pagina + 1,
                paginaAnterior: pagina - 1,
                ultimaPagina: Math.ceil(nroProductos / ITEMS_POR_PAGINA)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProducto = (req, res, next) => {
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                res.redirect('/');
            }
            res.render('tienda/detalle-producto', {
                producto: producto,
                titulo: producto.nombre,
                path: '/productos',
                autenticado: req.session.autenticado
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getIndex = (req, res, next) => {
    let pagina = +req.query.pagina
    if (!pagina) {
        pagina = 1
    }
    // const pagina = +req.query.pagina || 1;
    let nroProductos;
    Producto.find()
        .countDocuments()
        .then(nroDocs => {
            nroProductos = nroDocs;
            return Producto.find()
                .skip((pagina - 1) * ITEMS_POR_PAGINA)
                .limit(ITEMS_POR_PAGINA);

        })
        .then(productos => {
            res.render('tienda/index', {
                prods: productos,
                titulo: "Pagina principal de la Tienda",
                path: "/",
                autenticado: req.session.autenticado,
                paginaActual: pagina,
                tienePaginaSiguiente: ITEMS_POR_PAGINA * pagina < nroProductos,
                tienePaginaAnterior: pagina > 1,
                paginaSiguiente: pagina + 1,
                paginaAnterior: pagina - 1,
                ultimaPagina: Math.ceil(nroProductos / ITEMS_POR_PAGINA)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCarrito = (req, res, next) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then(usuario => {
            const productos = usuario.carrito.items;
            res.render('tienda/carrito', {
                path: '/carrito',
                titulo: 'Mi Carrito',
                productos: productos,
                autenticado: req.session.autenticado
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then(producto => {
            return req.usuario.agregarAlCarrito(producto);
        })
        .then(result => {
            res.redirect('/carrito');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEliminarProductoCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    req.usuario.deleteItemDelCarrito(idProducto)
        .then(result => {
            res.redirect('/carrito');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getPedidos = (req, res, next) => {
    Pedido.find({ 'usuario.idUsuario': req.usuario._id })
        .then(pedidos => {
            res.render('tienda/pedidos', {
                path: '/pedidos',
                titulo: 'Mis Pedidos',
                pedidos: pedidos,
                autenticado: req.session.autenticado
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


exports.postPedido = (req, res, next) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then(usuario => {
            const productos = usuario.carrito.items.map(i => {
                return { cantidad: i.cantidad, producto: { ...i.idProducto._doc } };
            });
            const pedido = new Pedido({
                usuario: {
                    nombre: req.usuario.email,
                    idUsuario: req.usuario
                },
                productos: productos
            });
            return pedido.save();
        })
        .then(result => {
            return req.usuario.limpiarCarrito();
        })
        .then(() => {
            res.redirect('/pedidos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.getComprobante = (req, res, next) => {
    const idPedido = req.params.idPedido;
    Pedido.findById(idPedido)
        .then(pedido => {
            if (!pedido) {
                return next(new Error('No se encontro el pedido'));
            }
            if (pedido.usuario.idUsuario.toString() !== req.usuario._id.toString()) {
                return next(new Error('No Autorizado'));
            }
            const nombreComprobante = 'comprobante-' + idPedido + '.pdf';
            // const nombreComprobante = 'comprobante' + '.pdf';
            const rutaComprobante = path.join('data', 'comprobantes', nombreComprobante);


            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="' + nombreComprobante + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(rutaComprobante));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Comprobante', {
                underline: true
            });
            pdfDoc.fontSize(14).text('---------------------------------------');
            let precioTotal = 0;
            pedido.productos.forEach(prod => {
                precioTotal += prod.cantidad * prod.producto.precio;
                pdfDoc
                    .fontSize(14)
                    .text(
                        prod.producto.nombre +
                        ' - ' +
                        prod.cantidad +
                        ' x ' +
                        'S/ ' +
                        prod.producto.precio
                    );
            });
            pdfDoc.text('---------------------------------------');
            pdfDoc.fontSize(20).text('Precio Total: S/' + precioTotal);

            pdfDoc.end();


            /*
            fs.readFile(rutaComprobante, (err, data) => {
              if (err) {
                return next(new Error(err));
              }
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader(
                'Content-Disposition', // inline o attachment
                'attachment; filename="' + nombreComprobante + '"'
              );
              res.send(data);
            }); */
            /*
            const file = fs.createReadStream(rutaComprobante);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
              'Content-Disposition',
              'inline; filename="' + nombreComprobante + '"'
            );
            file.pipe(res);*/
        })
        .catch(err => next(err));
};