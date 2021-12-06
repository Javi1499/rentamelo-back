const express = require('express');
const router = express.Router();
const pool = require("../models/connection");
const multer = require('multer');
const {verifyJWT} = require("../lib/helpers")
const {agregarProducto, obtenerProductos, obtenerProductoUnico, obtenerProductosDeUsuario, pausarPublicacion, reanudarPublicacion, eliminarPublicacion, filtrarProducto} = require("../controllers/productos.controller")
const storage = multer.memoryStorage();
const upload = multer({storage});


router.get('/', obtenerProductos ); //Ruta para obtener todos los productos publicados
router.get('/:idProduct',obtenerProductoUnico);//Ruta para agregar un nuevo producto
router.post('/tus-productos',verifyJWT, obtenerProductosDeUsuario);//Ruta para agregar un nuevo producto
router.post('/nuevo-producto',verifyJWT,upload.array('files',3), agregarProducto);//Ruta para agregar un nuevo producto
router.post('/pausar-publicacion/:idProduct',verifyJWT, pausarPublicacion);//Ruta para pausar una publicacion
router.post('/reanudar-publicacion/:idProduct',verifyJWT, reanudarPublicacion);//Ruta para reanudar una publicacion
router.post('/eliminar-publicacion/:idProduct',verifyJWT, eliminarPublicacion);//Ruta para eliminar una publicacion
router.post('/filtro/:idEstatus',verifyJWT, filtrarProducto);//Ruta para obtener productos filtrados



module.exports = router;