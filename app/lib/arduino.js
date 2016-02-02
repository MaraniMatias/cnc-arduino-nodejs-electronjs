const
  serialPort = require('serialport')
;
var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet
};

function reSet () {
  serialPort.list( (err, ports) => {
    if(ports && ports.length > 0){
      Arduino.port = new serialPort.SerialPort(ports.slice(-1)[0].comName,{
        parser: serialPort.parsers.readline('\r\n'),
        dataBits: 8, 
        baudrate:9600,
        parity: 'none',
        stopBits: 1,
        flowControl: false
      },false);// This does not initiate the connection.
      console.log('Puerto Selecionado %s',ports.slice(-1)[0].manufacturer);
      return true
    }else{
      Arduino.port = { comName : '' , manufacturer : ''};
      console.log('No Arduino.');
      return false
    }
  });
}


// ########################################################### //
module.exports = Arduino;