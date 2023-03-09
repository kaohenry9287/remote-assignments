const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");


const app = express();

app.use(bodyParser.json());
//確保資料是會以json型態送來後端
app.use(express.json());

//確保資料能從前後端互相跨越傳送
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cookieParser());

//healthcare需要
const { createTerminus } = require('@godaddy/terminus');

//使用user route
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes)

//HealthCheck服務相關
app.get('/', (req, res) => {
  res.send('ok')
})

const server = http.createServer(app);

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

//HealthCheck服務監聽位址 
server.listen(5000, ()=>{
  console.log('The application is running on localhost:5000!');
});
