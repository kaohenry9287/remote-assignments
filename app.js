const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');

const app = express();

app.use(bodyParser.json());

//healthcare需要
const { createTerminus } = require('@godaddy/terminus');

//view engine setup
app.set('view engine', 'ejs');

//使用route
const mainRoutes = require('./routes');
const usersRoutes = require('./routes/users');

app.use(mainRoutes);
app.use('/users', usersRoutes)

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
  const status = err.status || 500;
  res.status(status);
  res.render('error');
});

//HealthCheck服務監聽位址 
server.listen(3000, ()=>{
  console.log('The application is running on localhost:3000!');
});