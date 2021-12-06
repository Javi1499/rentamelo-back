const bcrypt = require('bcrypt');
const moment = require('moment');
const helpers = {};
const pool = require("../models/connection");
const jtw = require("jsonwebtoken");

helpers.encryptPassword = async (password)=>{
const salt =  await bcrypt.genSalt(10);
const passwordFinal = await bcrypt.hash(password,salt);
return passwordFinal;
};

helpers.loginPassword = async (password, passwordGuardada)=>{
  try {
      const res = await bcrypt.compare(password, passwordGuardada);       
    return res;
    
  } catch(e) {
      console.log(e);
      
  }


};

helpers.verifyJWT =  (req, res, next) =>{
    const token = req.headers["authorization"];
    if(!token){
        res.send("Necesitas token");
    } else{
      
        jtw.verify(token, "secretJWT",(err, decode)=>{
            if(err){
                res.json({auth:false, mensaje:"Te falta Auntenticarte"});
            } else {
                req.token = decode.email;
                req.idUser = decode.idUser
                console.log(req.idUser)
                next();
            }
        })
    }
}

// helpers.esAdmin = async (req, res, next) =>{
//     console.log(req.token+"Este es el id")
//    try {
//     const user = await pool.query(`SELECT * FROM usuarios where email = "${req.token}" `);
//     console.log(user);
//     if(user[0].rol !="admin") throw false;
//     console.log("es admin");
//     next()
//    } catch (error) {
//        res.json({status:400, mensaje:"No tienes permiso para realizar esta accion"})
//        return;
//    }


// }

helpers.obtenerHoraFinRenta = async( tiempoRenta)=>{
let fechaInicio = moment();

let fechaFinal = fechaInicio.clone();
fechaFinal= fechaFinal.add(tiempoRenta, 'days')

const fechaString =(fechaFinal.format("DD/MM/YYYY HH:mm "))

fechaInicio= fechaInicio.format("YYYY-MM-DD HH:MM");
fechaFinal= fechaFinal.format("YYYY-MM-DD HH:MM");

return {fechaInicio, fechaFinal, msj:fechaString};
}


module.exports = helpers;