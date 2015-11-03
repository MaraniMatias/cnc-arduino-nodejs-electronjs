var SerialPortStream = require('serial-port-stream');
var stream = new SerialPortStream('/dev/ttyACM0', { baudRate : 9600 });
var i=0,
  serialPort = require("serialport"),
  SerialPort = serialPort.SerialPort;

/*
setInterval(function () {
  i++;
  stream.write('[10,10,0]\n');
console.log(i);
  }, 1000);
*/
    sp = new SerialPort('/dev/ttyACM0',{
      parser: serialPort.parsers.readline("\n"),
      dataBits: 8, baudrate:9600, parity: 'none',
      stopBits: 1, flowControl: false
    },false);


setInterval(function () {
  i++;
  sp.open(function(err) {
    sp.drain(function(){});
    sp.write('[10,10,0]\n',function(err) {
      sp.close(function(err) {
        console.log(i)
      });//close
    });//write
  });// open
}, 1000);