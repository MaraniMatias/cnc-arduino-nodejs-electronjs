const
  serialPort = require('serialport')
;
var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet , sendCommand
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
      return true ;
    }else{
      Arduino.port = { comName : '' , manufacturer : ''};
      console.log('No Arduino.');
      return false ;
    }
  });
}

function sendCommand ( code , cb ) {
  if( Arduino.port.isOpen() ){ Arduino.port.close(); }
  Arduino.port.open( (err) => {
    Arduino.port.write(new Buffer(code+'\n'), (err) => {
      Arduino.port.drain( () => {      
        Arduino.port.on('data', (data) => {
          Arduino.port.close( (err) => {
            console.log(`Arduino end: ${data}`);
            cb(data.toString()); // callback()
          });//close
        });//data
      });// drain
    });//write
  });//open
}

// ########################################################### //
module.exports = Arduino;