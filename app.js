const morgan = require("morgan");
const helmet = require("helmet");
const cors = require('cors');
const express = require("express");
const app = express(helmet());


//Ajustes
app.set('port', process.env.PORT || 4006);
//cors
app.use(cors());
app.options("*", cors());
//Moddlewwares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}))

//Routes
 const autenticacionRouter = require("./routes/autenticacion.routes");
 const productosRouter = require("./routes/productos.routes");
 const rentasRouter = require("./routes/rentas.routes")
 const userRouter = require("./routes/user.routes")
// const autenticacion = require("./routes/login.routes");
app.use("/autenticacion",autenticacionRouter);
app.use("/productos", productosRouter);
app.use("/rentas", rentasRouter);
app.use("/usuarios", userRouter);

//arrancar server
app.listen(app.get('port'), ()=>{
    console.log('Server on port ', app.get('port'))
});