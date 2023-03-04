//啟用mysql2
const mysql = require('mysql2');
//隱藏密碼，從env檔拿取
require('dotenv').config();

//建立資料庫連接
const connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: "admin",
    database: process.env.DATABASE,
    password: process.env.PASSWORD
});

//連線錯誤與成功提示
connection.connect(function(error){
    if(error)
    {
        throw error;
    }
    else
    {
        console.log("MYSQL database is connected successfully!");
    }
});

//啟用連線
module.exports = connection;