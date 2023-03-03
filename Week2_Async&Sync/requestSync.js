// requestSync.js
const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";

function requestSync(url) {
    // write code to request url synchronously
    const request = require('sync-request');
    const res = request('GET', url);
    let end_time = new Date();
    console.log(end_time.getTime() - start_time.getTime());
}

let start_time = new Date();
requestSync(url) // would print out the execution time
requestSync(url)
requestSync(url)