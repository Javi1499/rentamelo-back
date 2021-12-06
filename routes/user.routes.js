const express = require('express');
const router = express.Router();
const pool = require("../models/connection");
const {obtenerInfoUsuario} = require("../controllers/user.controller")
const {verifyJWT} = require("../lib/helpers")

router.get("/profile", verifyJWT, obtenerInfoUsuario )


module.exports = router;