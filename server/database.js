//啟用mysql2
const mysql = require('mysql2');
//隱藏密碼，從env檔拿取
require('dotenv').config();

//建立資料庫連接
const pool = mysql.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: "admin",
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

//連線錯誤與成功提示
pool.getConnection(function(error,connection){

    try
    {
        if(error)
        {
            throw error;
        }
        else
        {
            console.log("MYSQL database is connected successfully!");
        }
    }

    finally
    {
        connection.release(connection);
    }
});

//啟用連線
module.exports = pool;