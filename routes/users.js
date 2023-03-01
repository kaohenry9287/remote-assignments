const express = require('express');
const router = express.Router();
const connection = require('../database');
const { check, validationResult } = require('express-validator');
const date = require('date-and-time');
const bodyParser = require('body-parser');

//app.use(logger('dev'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });


//Response Object(要放入Query API，含有id, name, email)
let Success_response = {
    "data": 
        {
          "user" : {},
          "date" : ""
        }
};

// (POST) User Sign Up API （限制輸入的內容，符合條件時把填入資料送入database，並轉跳至users頁面）
router.post('/', urlencodedParser, [
    //使用express-validator的功能來驗證使用者input內容是否符合規範
    check('username', 'Your username could only contain English alphabet and number!')
        .exists()
        .isLength({ max: 32 }),
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
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        //return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('users', {
            alert
        });
    }
    //資料輸入正確，準備存成JSON型態並INSERT進database中
    else
    { 
    //將使用者輸入值從req.body中拿出並存進對應變數
    const {username, email, password} = req.body;

    connection.query(
    "INSERT INTO `user`(name, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    function(err, results, fields) {
        //存入資料庫失敗，進行錯誤處理
        if (err)
        { 
        console.log(err);
        res.status(400).send('Client error response: 400');
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
            res.status(400).send('Client Error Response: 400');
            }
            else
            {
            //Response Object(要放入Query API，含有id, name, email)
            Success_response.data.user = results[0];
            const date = req.headers['request-date'];
            Success_response.data.date = date;
            res.status = 200;
            console.log(`Get Response Successfully: ${res.status}`);
            res.send(Success_response);
            };
        });
        //res.redirect(`/users?id=${userId}`);
        }
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
            if (err) 
            {
            res.status(400).send('Client Error Response: 400');
            }
            else
            {
            //Response Object(要放入Query API，含有id, name, email)
            Success_response.data.user = results[0];
            const date = req.headers['request-date'];
            Success_response.data.date = date;
            res.status = 200;
            console.log(`Get Response Successfully: ${res.status}`);
            res.send(Success_response);
            };
        });
});

module.exports = router;  



