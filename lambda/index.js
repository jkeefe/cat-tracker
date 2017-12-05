// Require modules here
const request = require('request');
const moment = require('moment');

var pi_urls = ['https://4588800fb59fe0e6bf28bfbc67bb6e03.resindevice.io/'];
var readings;

// Include global variables here (if any)

exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.

    readings = [];
    var promise_list = [];
    
    for (var i = 0; i < pi_urls.length; i++) {    
        promise_list.push(hitOnePi(pi_urls[i]));
    }
    
    // Hit all the pis
    var allPromise = Promise.all(promise_list);
    allPromise.then(function(){
        storeInDB(readings)
        .then(function(){
            
            var send_back = "OK";
            
            // format is callback(error, response);
            callback(null, send_back);
        });
    })
    .catch(function(error){
        console.log("Eeps. Something went wrong: ", error);
        callback(error);
    });
    


};

// Helper functions can go here

function hitOnePi(url) {
    return new Promise((resolve,reject) => {
        
        request(url, function (error, response, body) {
            
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                reject(error);
                return;
            }
            
            if (response.statusCode !== 200){
                console.log('statusCode:', response.statusCode);
                console.log('body:', response.body);
                resolve(null);
                return;
            }
            
            readings.push(body);
            resolve();            
        });        
    });
}

function storeInDB(data) {
    return new Promise ((resolve,reject) =>{
        
        var record = {};
        record.poll_time = moment().utc().format();
        record.devices = {};
        
        // loop through the device data and build 
        // a json object for inserting into the database
        for (var i = 0; i < data.length; i++) {
            
            record.devices[data[i].pi_number] = data[i];
            
        }    
        
        console.log(record);
        resolve();    
    });    
}