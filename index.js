var noble = require('noble');
var express = require('express');
var moment = require('moment');
var app = express();

var current_reading = 0;

// scan only the cat beacon's id
var serviceUUIDs = ['960c4a96244c11e2b29900a0c60077ad'];

// Listen for the cat beacon
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(serviceUUIDs);
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    
    current_reading = peripheral.rssi;
    console.log(current_reading);
    
});


// reply to request with "Hello World!"
app.get('/', function (req, res) {
    
    var payload = {};
    payload.report_time = moment().utc().format();
    payload.rssi_value = current_reading;
    
    res.send(JSON.stringify(payload));
    
});

//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

    var port = server.address().port;
    console.log('Cat Tracker app listening on port ', port);

});