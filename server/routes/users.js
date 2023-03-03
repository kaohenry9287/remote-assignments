const express = require('express');
const router = express.Router();
const connection = require('../database');
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
router.post('/', urlencodedParser, [
    //使用express-validator的功能來驗證使用者input內容是否符合規範(express-validator會自己去request裡面找對應的值)
    check('username', 'Your username could only contain English alphabet and number!')
        .exists()
        .isLength({ max: 32 })
        .matches(/^[A-Za-z0-9]*$/),
    check('email', 'Email is not valid!')
        .exists()
        .isEmail()
        .isLength({ max: 64 })
        .normalizeEmail(),
    check('password', 'Password should contain at least three of the four character types: 1.Uppercase letter(A~Z) 2.Lowercase letter(a~z) 3.Numbers(0~9) 4.Symbols')
        .exists()
        .isLength({ max: 255 })
        .matches(/(?=.{3,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/)
    ], 

    //資料輸入錯誤，alert錯誤訊息
    (req, res)=> {
    const errors = validationResult(req);

    //將使用者輸入值從req.body中拿出並存進對應變數
    const {name, email, password} = req.body;
    
    if(!errors.isEmpty()) 
    {
    //即便只是錯誤訊息，一樣維持以Object型態傳送，確保後端東西去前端時都一率是Object
    const errorMesssage = `Client error response: 400 => <Rule 1> Your username could only contain English alphabet and number!  <Rule 2> Your password should contain at least 3 of the 4 character types: (1)Uppercase letter(A~Z) (2)Lowercase letter(a~z) (3)Numbers(0~9) (4)Symbols`
    res.status(400).send({message: errorMesssage});
    }
    //資料輸入正確，準備存成JSON型態並INSERT進database中(用bcrypt加密)
    else
    { 
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }
    connection.query(
    "INSERT INTO `user`(name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    function(err, results, fields) {
        //存入資料庫失敗，進行錯誤處理
        if (err)
        { 
        console.log(err);
        res.status(403).send({message: `Email Already Exists: 403 => ${err}`});
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
            res.status(400).send({message:`Client error response: 400 => ${err}`});
            }
            else
            {
            //Response Object(要放入Query API，含有id, name, email)
            Success_response.data.user = results[0];
            const date = req.headers['request-date'];
            Success_response.data.date = date;
            res.status = 200;
            console.log(`Get Response Successfully: ${res.status}`);
            res.send(Success_response.data.user);
            };
        });
        }
    });
    });
    }
});  
  

// (GET) User Query API (依據網址中?id=req.query.id的部分來進行資料庫搜索，並顯示於頁面上)
router.get('/', (req, res)=>{
        const userId = req.query.id;
        connection.query(
            'SELECT id, name, email FROM user AS u WHERE u.id = ?',
            [userId],
            function (err, results, fields) {
            //用輸入的id沒有對應unique key => 此id不存在
            if (err) 
            {
            res.status(400).send({message:`Client error response: 400 => ${err}`});
            }
            //確定results有拿到東西，不是一個空的
            //Response Object(要放入Query API，含有id, name, email)
            else if (results.length > 0) 
            {
            Success_response.data.user = results[0];
            const date = req.headers['request-date'];
            Success_response.data.date = date;
            res.status = 200;
            console.log(`Get Response Successfully: ${res.status}`);
            res.send(Success_response);
            }
            //確定results是空的 => 此id值在資料庫裡還沒有對應的內容(超過目前有值的範圍)
            else{
                res.status(400).send({message:`User Not Existing: 403 => ${err}`});
            }
        });
});

module.exports = router;  



