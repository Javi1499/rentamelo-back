var mysql = require("mysql");
const {promisify} = require('util')

const {database} = require('./credenciales');

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        console.err("Database connection was closed");
        }   
    else if (err.code=="ER_CON_COUNT_ERROR"){
        console.err("DATABASE HAS TO MANY CONNECTIONS")
    }
}
 else if(connection) {connection.release()
console.log("DB esta xconnectada") ;
return
};
})
//Promisify parea convertir en promesas

pool.query=promisify(pool.query);
module.exports = pool;
