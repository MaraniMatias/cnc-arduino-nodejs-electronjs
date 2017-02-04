var Arduino = require("../app/lib/arduino.js");

Arduino.set(null, function(err, ardu) {
  //pingPong();
  runStop();
  console.log(ardu);
});

function pingPong() {
  /* Una ves que escribo en el puerto. */
  let cbWrite = (err) => {
      if (err) console.log(err);
    },
    /* Cuando arduino escribe en el puerto*/
    cbAnswer = (err, msg, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(msg, data);
      }
    };
  Arduino.sendGcode("20,20,20,14", cbWrite, cbAnswer);
}

function runStop() {
    Arduino.send("200,200,0,0", (err,msg) => {
      console.log(err,msg);
    });
  setTimeout(() => {
    Arduino.send('0,0,0,0', (err,msg) => {
      console.log(err,msg);
      Arduino.close((err)=>{
      console.log(err);
      });
    });
  }, 2000);
}
