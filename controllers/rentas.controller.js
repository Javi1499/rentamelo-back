const pool = require("../models/connection");
const helpers = require('../lib/helpers');
const moment = require('moment');
const { query } = require("express");
//const jtw = require("jsonwebtoken");

const rentasController = {
    realizarRenta: async (req, res) => {
        console.log("Entro")
        const idUser = req.idUser;
        const { rentDays, idProduct } = req.body;
        console.log(req.body)
        console.log(rentDays, idProduct, idUser)
        try {
            const infoProducto = await pool.query(`SELECT * FROM products WHERE idProduct = ${idProduct}`);
            if (infoProducto.length < 1) {
                throw 0
            }
            if(infoProducto[0].idUser==idUser){
                throw 1
            }

            const nuevaRenta = {
                idProduct,
                idLesser: infoProducto[0].idUser,
                idLessee: idUser,
                rentDays: rentDays,
                idStatus: 6
            }
            
            await pool.query(`INSERT INTO rents SET ?`, [nuevaRenta]);
            await pool.query(`UPDATE products SET idStatus=6 WHERE idProduct = ${idProduct}`);
            res.status(200).json({ mensaje: "Renta procesada. En espera de confirmacion", data: [] })
        } catch (error) {
            if (error == 0) {
               
                res.status(400).json({ mensaje: "El producto no existe", data: [] })
            } else if (error==1) {
                console.error(error)
                res.json({ status:402, mensaje: "No puedes rentarte un producto de tu propiedad", data: [] })
            } else{
                console.error(error)
            }
        }
      
    },
    confirmarRecepcion: async(req, res) =>{
        console.log("entro")
        const {idRent} = req.params; 
        const infoRenta = await pool.query(`SELECT rentDays from rents WHERE idRent = ${idRent}`);
        const rentDays = Number(infoRenta[0].rentDays)  
       const fechas= await helpers.obtenerHoraFinRenta(rentDays);
    
       const tiemposRenta = {
           startDate:fechas.fechaInicio,
           endDate: fechas.fechaFinal,
           idStatus: 5

       }
       try {
        await pool.query(`UPDATE rents SET ? WHERE idRent = ${idRent}`, [tiemposRenta])

        res.status(200).json({mensaje:`Tu renta termina el ${fechas.fechaFinal}`, data:[]})
           
       } catch (error) {
           console.error(error)
       }
      
    },
    obtenerRentasArrendatario: async(req, res) =>{
        console.log("entro")
        const {idUser} = req
       try {
        const rents = await pool.query(`SELECT idRent, products.name AS name,products.idProduct AS idProduct, products.description AS description, 
        users.firstName AS firstName, rents.idRent as idRent, rents.idStatus  as idStatus,  products.img1 as img1, users.lastName AS lastName, startDate, 
        endDate, status.description AS status, rentDays from rents
        JOIN products ON rents.idProduct = products.idProduct
        JOIN users ON rents.idLesser = users.idUser
        JOIN status ON rents.idStatus = status.idStatus WHERE idLessee = ${idUser}` )

        res.status(200).json({mensaje:"Esto es", data:rents})
           
       } catch (error) {
           console.error(error)
           res.status(400).json({mensaje: "Hubo un error", data:[]})
       }
      
    },
    obtenerRentasArrendador: async(req, res) =>{
        console.log("entro")
        const {idUser} = req
       try {
        const rents = await pool.query(`SELECT idRent, products.name AS name,products.idProduct AS idProduct, products.description AS description, 
        users.firstName AS firstName, rents.idRent as idRent, rents.idStatus  as idStatus,  products.img1 as img1, users.lastName AS lastName, startDate, endDate, status.description AS status, rentDays from rents
        JOIN products ON rents.idProduct = products.idProduct
        JOIN users ON rents.idLessee = users.idUser
        JOIN status ON rents.idStatus = status.idStatus WHERE idLesser = ${idUser}` )

        res.status(200).json({mensaje:"Esto es", data:rents})
           
       } catch (error) {
           console.error(error)
           res.status(400).json({mensaje: "Hubo un error", data:[]})
       }
      
    },
    finalizarRenta: async(req, res) =>{
        console.log("entro")
        const {idRent} = req.params;
       try {
        //Se obtienen dastos de la renta
        const rent = await pool.query(`SELECT * FROM rents WHERE idRent = ${idRent}`);

        //Se cambia el estatus a finalizado
        await pool.query(`UPDATE rents SET idStatus=7 WHERE idRent = ${idRent} `)
        //Se pone el producto en pausa
        await pool.query(`UPDATE products SET idStatus= 3 WHERE idProduct = ${rent[0].idProduct}`)

        res.status(200).json({mensaje:"Renta finalizada", data:[]})
           
       } catch (error) {
           console.error(error)
           res.status(400).json({mensaje: "Hubo un error", data:[]})
       }
      
    },
    validarRentaPropia: async(req, res) =>{
        console.log("entro")
        const {idProduct} = req.params;
        const {idUser} = req;
       try {
        //Se obtienen dastos de la renta
        const rent = await pool.query(`SELECT * FROM products WHERE idUser = ${idUser} AND idProduct=${idProduct}`);
        if(rent.length>0){
            res.status(200).json({mensaje:true, data:[]})
        } else{
            res.status(200).json({mensaje:false, data:[]})
        }
           
       } catch (error) {
           console.error(error)
           res.status(400).json({mensaje: "Hubo un error", data:[]})
       }
      
    }

}

module.exports = rentasController;