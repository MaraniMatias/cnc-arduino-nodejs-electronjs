var fileDir = './_arduino/g-code/g0_0001.ngc';
var gc = require("interpret-gcode");
var fs = require("fs");
var data = fs.readFileSync(fileDir);
var fileContent = data.toString();

// serial
var SerialPort = require("serialport").SerialPort;
var portName = '/dev/ttyACM0'; //change this to your Arduino port
var sendData = "";
var receivedData = "";
// serial

  history = gc(fileContent);
  //console.log(history[6].x);

/*
// listado de puertos
var serialPort = require("serialport");
serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
//  ##########
*/

var sp = new SerialPort(portName, {
  baudrate: 9600
  //dataBits: 8,
  //parity: 'none',
  //stopBits: 1,
  //flowControl: false
});


var indexLinea = 0;
sp.on("open", function () {
  //console.log('Conexion serial abierta.');
  sp.write(history[indexLinea].x+"\n", function(err, results) {
   console.log("Cordenadas: %s",history[indexLinea].x);
   if(err){console.log('err ' + err);}
    //console.log('results ' + results);
  });
  sp.on('data', function(data){
    console.log('\t Arduino envia "%s"',data);
    if(indexLinea < history.length) {
      console.log("Cordenadas: %s",history[indexLinea].x);
      sp.write(history[indexLinea].x+"\n", function(err, results) {
        if(err){console.log('err ' + err);}
        //console.log('results ' + results);
      });
      indexLinea++
    }else{
      sp.close();
    };

  });
});
