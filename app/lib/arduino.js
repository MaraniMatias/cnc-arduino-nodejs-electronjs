// export arduino sp
const
  serialPort = require('serialport')
  //,SerialPort = serialPort.SerialPort
;
var arduino = {
  port : {},
  reSet : reSet
};

function reSet () {
  serialPort.list( (err, ports) => {
    if(ports!==undefined && ports.length > 0){
      arduino.port = new serialPort.SerialPort(ports.slice(-1)[0].comName,{
        parser: serialPort.parsers.readline('\r\n'),
        dataBits: 8, 
        baudrate:9600,
        parity: 'none',
        stopBits: 1,
        flowControl: false
      },false);// para que no abra la conecion al crear
      console.log('Puerto Selecionado %s',ports.slice(-1)[0].manufacturer);
      //req.io.emit("lineaGCode", { nro:'',type:'',ejes:'',steps:'',travel:'',code:"Arduino: "+ ports.slice(-1)[0].manufacturer +" Puerto: "+ ports.slice(-1)[0].comName });
    }else{
      arduino.port = {};
            console.log('No Arduino.');
      //req.io.emit("lineaGCode", { nro:'',type:'',ejes:'',code:"No encuentro arduino.", steps:'',travel:'' });
    }
  });
}


// ########################################################### //
module.exports = arduino;