const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const date = require('date-and-time');
const mysql = require('mysql2');

const app = express();

app.use(bodyParser.json());

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

//啟用資料庫連線
module.exports = connection;

//Response Object(要放入Query API，含有id, name, email)
let Success_response = {
  "data": 
  {
    "user" : {},
    "date" : ""
  }
};

//資料庫Select funciton (用unique key email 找到對應資料)
function dbData(item, res, callback){
  connection.query(
    'SELECT id, name, email FROM user AS u WHERE u.email = ?',
    [item],
    function (error, results, fields) {
    if (error) throw error;
    Success_response.data.user = results[0];
    Success_response.data.date += current_time();
    callback(results[0].id);
    //res.redirect(res.redirect(`/users?id=${Success_response.data.user.id}`));
    res.status = 200;
    console.log(`Get Response Successfully: ${res.status}`);
    res.send(Success_response);
  });
}

//時間產生
function current_time(){
  const now = new Date();
  const format_time = `${date.format(now, 'ddd, DD MMM YYYY HH:mm:ss')} GMT`;
  return format_time;
};

//healthcare需要
const { createTerminus } = require('@godaddy/terminus');

//view engine setup
app.set('view engine', 'ejs');

//app.use(logger('dev'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const server = http.createServer(app);

//HealthCheck服務相關
function onSignal () {
  console.log('server is starting cleanup')
  // start cleanup of resource, like databases or file descriptors
}

async function onHealthCheck () {
  // checks if the system is healthy, like the db connection is live
  // resolves, if health, rejects if not
}

createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/healthcheck': onHealthCheck },
  onSignal
});


//首頁
app.get('/', (req, res)=> {
  res.render('index');
});

// (POST) User Sign Up API （限制輸入的內容，符合條件時把填入資料送入database，並轉跳至users頁面）
app.post('/users', urlencodedParser, [
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
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    connection.query(
      "INSERT INTO `user`(name, email, password) VALUES (?, ?, ?)",
      [username, email, password],
      function(err, results, fields) {
        if (results)
        {
          console.log("Store user's data into database successfully!");
          //使用dbSelect funciton找到對應資料的id
          dbData(email, res, console.log)
          ///根據從database拿回來的id，去往新的reute > /users?id=:id
          //.then(res.redirect(`/users?id=${Success_response.data.user.id}`));    
        }
        else
        {
          console.log(err);
        }
      },
    );
  }
});


// (GET) 剛進頁面render出讓使用者填寫的欄位
app.get('/users', (req, res)=> {
    res.render('users');
});

// (GET) User Query API (依據網址中?id=req.params.id的部分來進行資料庫搜索，並顯示於頁面上)
app.get(`/users?id=${Success_response.data.user.id}`, (req, res)=>{
  connection.query(
    'SELECT id, name, email FROM user AS u WHERE u.id = ?',
    [req.params.id],
    function (error, results, fields) {
    if (error) throw error;
    Success_response.data.user = results[0];
    Success_response.data.date += current_time();
    callback(results[0].id);
    //res.redirect(res.redirect(`/users?id=${Success_response.data.user.id}`));
    res.status = 200;
    console.log(`Get Response Successfully: ${res.status}`);
    res.send(Success_response);
  });
});

//錯誤處理1 Email Already Exist
app.use((req, res, next) => {
  const err = new Error('Email Already Exists: 403');
  err.status = 403;
  next(err);
});

//錯誤處理2 User Not Existing
app.use((req, res, next) => {
  const err = new Error('User Not Existing: 403');
  err.status = 403;
  next(err);
});

//錯誤處理3 Client Error Response
app.use((req, res, next) => {
  const err = new Error('Client Error Response: 400');
  err.status = 400;
  next(err);
});
//錯誤處理render出錯誤訊息於頁面上
app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
});

//HealthCheck服務監聽位址 
server.listen(3000, ()=>{
  console.log('The application is running on localhost:3000!');
});