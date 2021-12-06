const pool = require("../models/connection");
const helpers = require('../lib/helpers');
const jtw = require("jsonwebtoken");

const controladorAutenticacion = {
    iniciarSesion: async (req, res) => {
        console.log(req.body);
        const { email, password } = req.body;
        const respuesta = await pool.query(`SELECT idUser, email, firstName, password FROM users WHERE email = ?`, [email]);
        if (respuesta.length > 0) {
            const usuario = respuesta[0];
            const validarPassword = await helpers.loginPassword(password, usuario.password);
            console.log(password)
            if (validarPassword) {

                const user={
                    email:respuesta[0].email,
                    usuario:respuesta[0].usuario,
                    idUser:respuesta[0].idUser
                }
                const token = jtw.sign(user, "secretJWT");
                res.json({ status: 200, mensaje: "Bienvenido", auth: true, token, data: {idUser:respuesta[0].idUser}})
                return
            }
            res.json({ status: 400, mensaje: "Contraseña incorrecta", auth: false });
            return;
        }
        res.json({ status: 400, mensaje: "Usuario no existe", auth: false });
    },
    singUp: async (req, res) => {
        const { firstName, lastName,phoneNumber,birthday,email, password  } = req.body;
        const newUser = {
            firstName,
            lastName,
            phoneNumber,
            birthday,
            email,
            password,
            idStatus: 1
        }

        const emailVerificaction = await pool.query(`SELECT * FROM users WHERE email = "${email}"`)
        if(emailVerificaction.length>0){
            res.json({ status: 400, mensaje:"Este correo ya esta registrado",data:[]});
            return;
        }

        newUser.password = await helpers.encryptPassword(password);
        const result = await pool.query("INSERT INTO users set ?", [newUser]);
        res.json({ status: 200, data:result });
    }

}



module.exports = controladorAutenticacion