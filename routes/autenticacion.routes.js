const express = require('express');
const router = express.Router();
const pool = require("../models/connection");
const {iniciarSesion, singUp} = require("../controllers/autenticacion.controller")

router.post('/login',iniciarSesion);
router.post('/registro', singUp);

module.exports = router;