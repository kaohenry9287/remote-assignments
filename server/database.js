//啟用mysql2
const mysql = require('mysql2');

//建立資料庫連接
const connection = mysql.createConnection({
    host: 'database-1.crdxuqmw65ih.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    database: 'assignment',
    password: "henry0208"
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