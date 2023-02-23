//初始化express並用terminus建立HealthCheck服務
const http = require('http');
const express = require('express');
const { createTerminus } = require('@godaddy/terminus');

const app = express();

const server = http.createServer(app);

//HealthCheck服務相關(1)
function onSignal () {
  console.log('server is starting cleanup')
  // start cleanup of resource, like databases or file descriptors
}
//HealthCheck服務相關(2)
async function onHealthCheck () {
  // checks if the system is healthy, like the db connection is live
  // resolves, if health, rejects if not
}
//HealthCheck服務相關(3)
createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/healthcheck': onHealthCheck },
  onSignal
})
//HealthCheck服務監聽位址 
server.listen(3000, ()=>{
  console.log('The application is running on localhost:3000!');
});


//Home Page
app.get('/', (request, response)=>{
  response.send('This is Home Page!');
});