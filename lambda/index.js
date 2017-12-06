// Require modules here
const request = require('request');
const moment = require('moment');
var mongodb = require('mongodb');

const mongo_url = "mongodb://" + process.env.MONGO_DB_USER + ":" + process.env.MONGO_DB_USER_PASS + "@ds111818-a0.mlab.com:11818,ds111818-a1.mlab.com:11818/bot-workshop-db?replicaSet=rs-ds111818";

var pi_urls = ['https://4588800fb59fe0e6bf28bfbc67bb6e03.resindevice.io/', 'https://d5a1b66f3fbe4bfa51dadf4b224d2772.resindevice.io'];

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
            
            var pi_data = JSON.parse(body);
            readings.push(pi_data);
            resolve();            
        });        
    });
}

function storeInDB(data) {
    return new Promise ((resolve,reject) => {
        
        var record = {};
        record.poll_time = moment().utc().format();
        record.devices = {};
        
        // loop through the device data and build 
        // a json object for inserting into the database
        for (var i = 0; i < data.length; i++) {
            
            record.devices[data[i].pi_number] = data[i];
            
        }
        
        mongodb.connect(mongo_url, function(err, db) {
            
            if (err) {
                console.log("Error opening database:", err);
                reject();
                return;
            }
            
            console.log("Connected successfully to server");
            console.log(db);

            var collection = db.collection('cat-tracker-data');

            // Insert some documents
            collection.insertOne(record, function(error, result) {
                
                if (error) {
                    console.log("Error opening database:", error);
                    reject();
                    return;
                }
                
                console.log("Inserted document into the collection");
                db.close();
                resolve('{"status":"OK"}');
                
            });
            
        });
        
    });  
}