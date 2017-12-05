var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    console.log("id:", peripheral.id);
    console.log("uuid:", peripheral.uuid);
    console.log("advertising:", peripheral.advertisement);
    console.log("rssi:", peripheral.rssi);
    console.log("services", peripheral.services);
    console.log();
});

