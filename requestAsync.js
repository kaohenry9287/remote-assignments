// requestAsync.js
const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";

function requestCallback(url, callback) {
    // write code to request url asynchronously
    const XMLHttpRequest = require('xhr2');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.onload = () =>{
        //success
        if(xhr.status ===200){
            let end_time = new Date();
            callback(end_time.getTime() - start_time.getTime());
        //fail
        }else{
            callback("Request has failed!")
        }
    }

}

function requestPromise(url) {
    // write code to request url asynchronously with Promise
    const XMLHttpRequest = require('xhr2');
    const xhr = new XMLHttpRequest();
    return new Promise((resolve ,reject)=>{
        xhr.open('GET', url);
        xhr.send(null);

        xhr.onload = () =>{
            if(xhr.status === 200){
                let end_time = new Date();
                resolve(end_time.getTime() - start_time.getTime());
            }else{
                reject(new Error(xhr.statusText));
            }
        }
    });
};

async function requestAsyncAwait(url) {
    // write code to request url asynchronously
    // you should call requestPromise here and get the result using
    try{
        const result = await requestPromise(url);
        console.log(result);
    }catch(error){
        console.log('Request has failed!',error);
    }
}

let start_time = new Date();
requestCallback(url, console.log); // would print out the execution time
requestPromise(url).then(console.log);
requestAsyncAwait(url);