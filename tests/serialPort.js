// For this module delete the './../app/node_modules' folder and rerun 'npm install' in './../app' without 'grunt buildmodule'
var Arduino = require("../app/lib/arduino.js");

console.log("Para este modulo borre la carpeta './../app/node_modules'y vuelva a correr npm install en './../app' sin grunt buildmodule");

Arduino.set(null, function(err, ardu) {
  pingPong();
  //runStop();
  console.log(ardu);
});

function pingPong() {
  let i = 0;
  /* Una ves que escribo en el puerto. */
  let cbWrite = (err) => {
      if (err) console.log(err);
      console.log(i);
    },
    /* Cuando arduino escribe en el puerto*/
    cbAnswer = (err, msg, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(msg, data);
      }
      if (i < 100) {
        Arduino.sendGcode("20,20,20,14", cbWrite, cbAnswer);
        i++;
      } else {
        Arduino.close();
      }
    };
  Arduino.sendGcode("20,20,20,14", cbWrite, cbAnswer);
}

function runStop() {
  Arduino.send("200,200,0,0", (err, msg) => {
    console.log(err, msg);
  });
  setTimeout(() => {
    Arduino.send('0,0,0,0', (err, msg) => {
      console.log(err, msg);
      Arduino.close();
    });
  }, 2000);
}
