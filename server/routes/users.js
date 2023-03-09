const express = require('express');
const router = express.Router();
const pool = require('../database');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require("express-session");

//加密密碼，讓使用者的密碼不會以明碼方式存在資料庫
const bcrypt = require("bcrypt");
const saltRounds = 10;

//app.use(logger('dev'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });


//Response Object(要放入Query API，含有id, name, email)
let Success_response = {
    "data": 
        {
          "user" : {},
          "date" : ``
        }
};

// (POST) User Sign Up API （限制輸入的內容，符合條件時把填入資料送入database，並轉跳至users頁面）
router.post('/', (req, res)=> {

    //將使用者輸入值從req.body中拿出並存進對應變數
    const {name, email, password} = req.body;

    //輸入值規則
    const nameRule = /^[a-zA-Z0-9]+$/;
    const emailRule = /^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|(?=.*[^\w\s])).{3,}$/;

    //比對與回傳錯誤警告語
    if(name.search(nameRule) === -1){
        res.status(400).json({message: "Your username could only contain English alphabet and number!"});
    };
    if (email.search(emailRule) === -1){
        res.status(400).json({message: "Email is not valid!"});
    };
    if (password.search(passwordRule) === -1){
        res.status(400).json({message: "Password should contain at least three of the four character types:  1.Uppercase letter(A~Z)  2.Lowercase letter(a~z)  3.Numbers(0~9)  4.Symbols"});
    };

    //資料輸入正確，準備存成JSON型態並INSERT進database中(用bcrypt加密)
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {console.log(err);}

        pool.getConnection(function(err, connection){

            try{
                connection.query(
                    "INSERT INTO `user`(name, email, password) VALUES (?, ?, ?)",
                    [name, email, hash],
                    function(err, results, fields) {
                        //存入資料庫失敗，進行錯誤處理
                        if (err)
                        { 
                        console.log(err);
                        res.status(403).json({message: `Email Already Exists: 403 => ${err}`});
                        }
                        //資料存入資料庫成功，擷取ID後redirect至有對應query String的route
                        else
                        {
                        console.log("Store user's data into database successfully!");
                        const userId = results.insertId;
                        //根據userID找到正確的資料，顯示於頁面
                        connection.query(
                            'SELECT id, name, email FROM user AS u WHERE u.id = ?',
                            [userId],
                            function (err, results, fields) {
                            if (err) 
                            {
                            res.status(400).json({message:`Client error response: 400 => ${err}`});
                            }
                            else
                            {
                            //Response Object(要放入Query API，含有id, name, email)
                            Success_response.data.user = results[0];
                            const date = req.headers['request-date'];
                            Success_response.data.date = date;
                            //進行跨端傳送前要記得把物件轉成JSON型態
                            res.status(200).json(Success_response.data.user);
                            console.log(`Get Response Successfully!`);
                            };
                        });
                        }
                    });
            }
            //不管成功與否一定要release
            finally
            {
                pool.releaseConnection(connection);
            }

        })
    });
    
});  
  

// (GET) User Query API (依據網址中?id=req.query.id的部分來進行資料庫搜索，並顯示於頁面上)
router.get('/', (req, res)=>{
        const userId = req.query.id;

        pool.getConnection(function(err,connection){

            try{
                connection.query(
                    'SELECT id, name, email FROM user AS u WHERE u.id = ?',
                    [userId],
                    function (err, results, fields) {
                    //用輸入的id沒有對應unique key => 此id不存在
                    if (err) 
                    {
                    res.status(400).json({message:`Client error response: 400 => ${err}`});
                    }
                    //確定results有拿到東西，不是一個空的
                    //Response Object(要放入Query API，含有id, name, email)
                    else if (results.length > 0) 
                    {
                    Success_response.data.user = results[0];
                    const date = req.headers['request-date'];
                    Success_response.data.date = date;
                    //進行跨端傳送前要記得把物件轉成JSON型態
                    res.status(200).json(Success_response);
                    console.log(`Get Response Successfully!`);
                    }
                    //確定results是空的 => 此id值在資料庫裡還沒有對應的內容(超過目前有值的範圍)
                    else
                    {
                        res.status(400).json({message:`User Not Existing: 403 => ${err}`});
                    }
                });
            }
            //不管成功與否一定要release
            finally
            {
                pool.releaseConnection(connection);
            }

        })
});

module.exports = router; 