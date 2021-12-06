const pool = require("../models/connection");
const AWS = require('aws-sdk');
const e = require("express");



const controladorProductos = {
    agregarProducto: async (req, res) => {
        console.log("Entro")
        const { name, description, price, idDeliveryTime, idLocation, idCategory } = req.body;

        const nuevoProducto = {
            name,
            description,
            price,
            idDeliveryTime,
            idLocation,
            idUser: req.idUser,
            img1: '',
            img2: '',
            img3: '',
            idCategory,
            idStatus: 1
        }
        const files = req.files;

        let s3Bucket = new AWS.S3({
            accessKeyId: "AKIASERNXXT3VJIMZOKI",
            secretAccessKey: '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',
            region: "us-east-2"
        });
        for (let index = 0; index < files.length; index++) {
            const uniqueName = (Date.now()).toString();
            const params = {
                ACL: 'public-read',
                Body: files[index].buffer,
                Bucket: "rentamelo",
                ContentType: files[index].mimetype,
                Key: uniqueName,
            };
            let urlDefault = "https://rentamelo.s3.us-east-2.amazonaws.com/"
            s3Bucket.upload(params, (err, data) => {
                if (err) return res.status(500).json({ mensaje: "Hubo un error al cargar la imagen", data: [] });

                return data
            })
            if (index == 0) {
                const urlImg = urlDefault + uniqueName;
                nuevoProducto.img1 = urlImg;
            } else if (index == 1) {
                const urlImg = urlDefault + uniqueName;
                nuevoProducto.img2 = urlImg;
            } else if (index == 2) {
                const urlImg = urlDefault + uniqueName;
                nuevoProducto.img3 = urlImg;
            }
        }


        try {
            pool.query("INSERT INTO products set ?", [nuevoProducto])
            return res.status(200).json({ mensaje: "Tu producto fue publicado correctamente", data: [] })
        } catch (error) {
            res.status(400).json({ mensaje: "Hubo un error al publicar tu producto", data: [] })
        }

    },

    obtenerProductos: async (req, res) => {
        try {
            const data = await pool.query(`SELECT idProduct,name, price, idCategory, products.description as description,
        deliveryTime.description AS deliveryTime,city as location, products.img1 from products 
        JOIN location ON location.idLocation =  products.idLocation 
        JOIN deliveryTime ON deliveryTime.idDeliveryTime = products.idDeliveryTime WHERE products.idStatus=1; 
        `);
            if (data.length > 0) {
                res.status(200).json({ mensaje: "Estos son los productos", data: data })
                return
            };
            throw 0

        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "No hay productos para mostrar", data: [] })
            }
        }
    },
    obtenerProductoUnico: async (req, res) => {
        const { idProduct } = req.params;
console.log(idProduct)
        try {
            const producto = await pool.query(`SELECT idProduct, name, price, idCategory, products.description as description,
            deliveryTime.description AS deliveryTime,city as location, img1,img2, img3 , idUser from products 
            JOIN location ON location.idLocation =  products.idLocation 
            JOIN deliveryTime ON deliveryTime.idDeliveryTime = products.idDeliveryTime WHERE products.idProduct = ${idProduct}`);
            const infoUsuario = await pool.query(`SELECT firstName, lastName from users WHERE idUser =${producto[0].idUser}`)
            if (producto.length > 0) {
                res.status(200).json({ mensaje: "Este es el producto", data: { producto: producto[0], infoUsuario: infoUsuario[0] } })
                return
            }
            throw 0
        } catch (error) {
            if (error == 0) {
                res.status(400).json({ mensaje: "No hay productos para mostrar", data: [] })
            } else{
                console.error(error)
            }
        }
    },
    obtenerProductosDeUsuario: async (req, res) => {
        const idUser = req.idUser;
        try {
            const producto = await pool.query(`SELECT idProduct, name, price, idCategory, products.description as description,
            deliveryTime.description AS deliveryTime,city as location, img1, products.idStatus from products 
            JOIN location ON location.idLocation =  products.idLocation 
            JOIN deliveryTime ON deliveryTime.idDeliveryTime = products.idDeliveryTime 
            WHERE products.idUser = ${idUser} AND idStatus != 2 `);

            if (producto.length > 0) {
                res.status(200).json({ mensaje: "Este es el producto", data: producto })
                return
            }
            throw 0
        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "No hay productos para mostrar", data: [] })
            }
        }
    },
    pausarPublicacion: async (req, res) => {
        const { idProduct } = req.params;
        try {
            await pool.query(`UPDATE products SET idStatus = 3 WHERE idProduct = ${idProduct}`);
            res.status(200).json({ mensaje: "Publicacion pausada", data: [] })

        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "Hubo un error", data: [] })
            }
        }
    },
    reanudarPublicacion: async (req, res) => {
        const { idProduct } = req.params;
        try {
            await pool.query(`UPDATE products SET idStatus = 1 WHERE idProduct = ${idProduct}`);
            res.status(200).json({ mensaje: "Publicacion publicada", data: [] })

        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "Hubo un error", data: [] })
            }
        }
    },
    eliminarPublicacion: async (req, res) => {
        const { idProduct } = req.params;
        try {
            await pool.query(`UPDATE products SET idStatus = 2 WHERE idProduct = ${idProduct}`);
            res.status(200).json({ mensaje: "Publicacion eliminada", data: [] })

        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "Hubo un error", data: [] })
            }
        }
    },
    filtrarProducto: async (req, res) => {
        const idUser = req.idUser;
        const { idEstatus } = req.params;
        try {
            const data = await pool.query(`SELECT * from products WHERE idStatus = ${idEstatus} AND idUser = ${idUser}`);
            res.status(200).json({ mensaje: "Publicacion eliminada", data})
        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "Hubo un error", data: [] })
            }
        }
    },
    filtrarCategoria: async (req, res) => {
        const {idCategory} = req.params;
        try {
            const data = await pool.query(`SELECT idProduct,name, price, idCategory, products.description as description,
        deliveryTime.description AS deliveryTime,city as location, products.img1 from products 
        JOIN location ON location.idLocation =  products.idLocation 
        JOIN deliveryTime ON deliveryTime.idDeliveryTime = products.idDeliveryTime WHERE products.idStatus=1 and idCategory = ${idCategory}; 
        `);
            if (data.length > 0) {
                res.status(200).json({ mensaje: "Estos son los productos", data: data })
                return
            };
            throw 0

        } catch (error) {
            if (error == 0) {
                res.json({ mensaje: "No hay productos para mostrar", data: [] })
            }
        }
    }


}

module.exports = controladorProductos