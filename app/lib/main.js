const 
  fs = require('fs'),
  gc = require("./gcode"),
  serialPort = require('serialport'),
  config  = require('./config.json'),
  EventEmitter = require('events'),
  util = require('util')
;

var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet
};

function getMiliSeg ()  {
  return config.motor.xy.steps * config.motor.xy.time / config.motor.xy.advance ;
}

var File = {
  gcode   : [],
  dir     : '' ,
  name    : 'Sin Archivo',
  lines   : 0 ,
  travel    : 0 ,
  segTotal  : 0
};
var arduino = {
  comName : Arduino.port.comName,
  manufacturer : Arduino.port.manufacturer,
  reSet : Arduino.reSet
};

function setFile ( dirfile ) {
  if (!dirfile){ return {}; }
  File.dir = dirfile[0];
  File.gcode = gc(fs.readFileSync(dirfile[0]).toString());
  File.name = dirfile[0].split('/')[dirfile[0].split('/').length-1];
  File.lines = File.gcode.length;
  File.travel = File.gcode[File.gcode.length-1].travel;
  File.segTotal = File.gcode[File.gcode.length-1].travel * getMiliSeg();
  return File;
  //cb(File) ;
}

function sendCommand ( code , callback ){
  //console.log(`${__filename}\n sendCommand, type: ${type}, code: ${code}`);
  if( Arduino.port.comName !== '' ){
    if( Arduino.port.isOpen() )    Arduino.port.close(); 
    Arduino.port.open( (err) => {
      Arduino.port.write(new Buffer(code+'\n'), (err) => {
        //req.io.broadcast('lineaGCode', line ); // emitir enviar lines procesada a app.js
        Arduino.port.drain( () => {
          Arduino.port.on('data', (data) => {
            Arduino.port.close( (err) => {
              if (typeof (callback) === 'function') {
                callback({type:'none',data:data.toString().split(',')});
              }
            });//close
          });//data
        });// drain
      });//write
    });//open
  } else {
    if (typeof (callback) === 'function') {
      callback({type:'error',data:'Arduino not selected'});
    }
    //throw new Error('Arduino no seleccionado');
  }
}

function reSet () {
  return new Promise(function (resolve, reject){
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
        console.info('Puerto Selecionado %s',ports.slice(-1)[0].manufacturer);
        resolve(ports.slice(-1)[0].manufacturer);
      }else{
        Arduino.port = { comName : '' , manufacturer : ''};
        console.warn('No Arduino.');
        resolve('');
      }
    });
  })// promise
}

function getPasos(l){
  var a = l!==0 ? File.gcode[l-1].ejes : File.gcode[l].ejes;
  var x = [0,0,0];
  var b = File.gcode[l].ejes;
  x[0] = Math.round((b[0]-a[0]) * config.motor.xy.steps / config.motor.xy.advance);
  x[1] = Math.round((b[1]-a[1]) * config.motor.xy.steps / config.motor.xy.advance);
  x[2] = Math.round((b[2]-a[2]) * config.motor.z.steps / config.motor.z.advance);
  return x;
}
function start (nro) { 
  if( Arduino.port.comName !== '' ){
    if( Arduino.port.isOpen() ){ Arduino.port.close(); }
    if(Arduino.port.comName !== '' && File.gcode.length > 0){
      // arduino
      Arduino.port.open( (err) => {
        if( nro !== null){ // validar mejor :D
          Arduino.port.write(new Buffer(getPasos(nro)+'\n'),function(err,results){
            Arduino.port.drain( () => {
              console.log("I: %s - Ejes: %s",nro,File.gcode[nro].ejes);
            })
          })//write
        }

Arduino.port.on('data', function(data) {
var d = data.toString().split(',');
if(d[0]==0 && d[1]==0 && d[2]==0){
  nro++;
  if(nro < File.gcode.length){
    Arduino.port.write(new Buffer(getPasos(nro)+'\n'),function(err,results){
      Arduino.port.drain( () => {
        console.log("I: %s - Ejes: %s",nro,File.gcode[nro].ejes);
      });
    });//write
  }else{
    Arduino.port.close(function(err){
      console.log("Finish.");
    });//close
  }
}else{//Pause
  Arduino.port.close(function(err) {
    console.log("Pause: %s",data);
  });//close
}
})//dta

      });// open
    }
  }else{
    // error no esta ardu
  }

}

module.exports = {
  Arduino : arduino , File  , setFile , sendCommand , start
};


/*
function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);
const myEmitter = new MyEmitter();

myEmitter.on('Terminado', function() {
  console.log('Terminado');
});
myEmitter.on('Pausado', function() {
  console.log('Pausado');
});
*/