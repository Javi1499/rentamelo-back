const pool = require("../models/connection");
const e = require("express");



const controladorUsuarios = {
    obtenerInfoUsuario: async (req, res) => {
       const {idUser} = req;

       const dataUser = await pool.query(`SELECT * FROM users WHERE idUser = ${idUser}`);

       delete dataUser[0].creationDate;
       delete dataUser[0].password;
       delete dataUser[0].apellido_materno;
       res.status(200).json({ mensaje: "Esta es la información", data: dataUser[0] })
    },


}

module.exports = controladorUsuarios