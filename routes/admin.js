const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth');
;

const router = express.Router();


// /admin/crear-producto
router.get('/crear-producto',
    [
        body('nombre', 'El nombre del producto debe ser una texto de no menos de 3 caracteres')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        //body('urlImagen').isURL(),
        body('precio').isFloat(),
        body('descripcion')
            .isLength({ min: 10, max: 400 })
            .trim()
    ],
    isAuth, 
    adminController.getCrearProducto);

// /admin/productos
router.post('/crear-producto', isAuth, adminController.postCrearProducto);

router.get('/editar-producto/:idProducto', isAuth, adminController.getEditarProducto);

router.post('/editar-producto', 
    [
        body('nombre', 'El nombre del producto debe ser una texto de no menos de 3 caracteres')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        //body('urlImagen').isURL(),
        body('precio').isFloat(),
        body('descripcion', 'La descripcion debe tener no menos de 10 ni mas de 400 caracteres')
            .isLength({ min: 10, max: 400 })
            .trim()
    ],
    isAuth, 
    adminController.postEditarProducto);

router.post('/eliminar-producto', isAuth, adminController.postEliminarProducto);

router.delete('/producto/:idProducto', isAuth, adminController.deleteProducto);


router.get('/productos', isAuth, adminController.getProductos);

module.exports = router;
