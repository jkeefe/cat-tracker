// from https://github.com/wouterbulten/kalmanjs

var KalmanFilter = require('kalmanjs').default;

//Apply kalman filter
var kalmanFilter = new KalmanFilter({R: 0.01, Q: 3});

var noisyDataConstant = [-79, -84, -91, -84, -79, -92, -77, -90, -71, -79, -94, -95, -85, -75, -88, -90, -90, -81, -93, -79, -80, -92, -78, -80, -82, -80, -95, -78, -93, -80, -95, -81, -93, -82, -96, -80, -75, -81, -84, -94, -89, -86, -81, -85, -88, -84, -81, -93, -88, -91, -75, -83, -91, -72, -83, -89, -85, -82, -74, -75, -91, -82, -76, -87, -80, -73, -75, -87, -81, -96, -81, -76, -78, -92, -84, -95, -81, -86, -94, -76, -89, -76, -87, -82, -90, -89, -83, -83, -98, -82, -91, -86, -85, -91, -86, -80, -76, -83, -78, -92, -83, -85, -94, -87, -84, -83, -70, -90, -81, -82, -92, -91, -85, -93, -72, -97, -84, -91, -73, -83, -83, -72, -77, -73, -83, -92, -96, -96, -79, -95, -94, -83, -90, -85, -91, -83, -78];

console.log(`index,raw,kalman`);



var dataConstantKalman = noisyDataConstant.map(function(v, i) {
    console.log(i + ","+v+","+kalmanFilter.filter(v));
    return kalmanFilter.filter(v);
});


var raw_sum = noisyDataConstant.reduce(function(a, b) { return a + b; });
var raw_avg = raw_sum / noisyDataConstant.length;
console.log("raw average:", raw_avg);

var kalmen_sum = dataConstantKalman.reduce(function(a, b) { return a + b; });
var kalman_avg = kalmen_sum / dataConstantKalman.length;
console.log("kalmen average:", kalman_avg);


// console.log(dataConstantKalman);