var Arduino = require("../app/lib/arduino.js");

Arduino.list(function (ports) {
  console.log(ports);
});

Arduino.set(function (comName, manufacturer) {
  console.log(comName, manufacturer);
});

setTimeout(() => {
  Arduino.send('200,200,0', () => {
    console.log("fin 200");
  });
}, 1000);
setTimeout(() => {
  Arduino.send('0,0,0', () => {
    console.log("fin 0");
  });
}, 1050);