var noble = require('noble');
var express = require('express');
var moment = require('moment');
var KalmanFilter = require('kalmanjs').default;

var app = express();
var kalmanFilter = new KalmanFilter({R: 0.01, Q: 3});

var current_reading = 0;
var reading_array = [];
var current_reading_time;
var current_reading_timestamp;

// the service id changes if we reconfigure the device
// but the end of the id seems to stay static. so we'll look
// for that.
var catServiceTail = /b29900a0c60077ad$/;

// Listen for the cat beacon
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {

    if (peripheral.advertisement.serviceUuids.length > 0 && peripheral.advertisement.serviceUuids[0].match(catServiceTail)) {
        current_reading = peripheral.rssi;
        current_reading_time = moment(); //now
        current_reading_timestamp = current_reading_time.utc().format();
        
        // add reading to the current reading_array
        reading_array.push(current_reading);
        
        // limit the array to 30 readings using "shift"
        // to remove first element
        if (reading_array.length > 30) {
            reading_array.shift();
        }
        
    }
    
});


// reply to request 
app.get('/', function (req, res) {
    
    var kalman_reading = null;
    
    // calculate the kalman values
    var dataConstantKalman = reading_array.map(function(v) {
        return kalmanFilter.filter(v);
    });
    
    // grab the last one
    if (dataConstantKalman.length > 0) {
        kalman_reading = dataConstantKalman[dataConstantKalman.length -1];
    }
    
    // check for old readings, and pass null if nothing in the last minute
    var time_now = moment();
    if (time_now.diff(current_reading_time, 'minutes') >= 1) {
        current_reading = null;
        kalman_reading = null;
    }


    var payload = {};
    payload.last_detection = current_reading_timestamp;
    payload.raw_value = current_reading;
    payload.smooth_value = kalman_reading;
    payload.pi_number = process.env.PI_NUMBER;
    payload.pi_name = process.env.PI_NAME;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(payload));

});

//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

    var port = server.address().port;
    console.log('Cat Tracker app listening on port ', port);

});