'use strict'
const 
  debug = true,
  fs = require('fs'),
  gc = require("./gcode"),
  serialPort = require('serialport'),
  //config  = require('./config.json'),
  EventEmitter = require('events'),
  util = require('util'),
  dirConfig = `${__dirname}/config.json`;
;

var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet
};

function getMiliSeg ()  {
  fs.readFile( dirConfig , "utf8", function (error, data) {
    let config = JSON.parse(data);
    let steps   = ( config.motor.x.steps   + config.motor.y.steps   ) / 2;
    let time    = ( config.motor.x.time    + config.motor.y.time    ) / 2;
    let advance = ( config.motor.x.advance + config.motor.y.advance ) / 2;
    return steps * time / advance ;
  });
}

var File = {
  workpiece : { x:300, y:400 },
  scale     : 1,
  gcode     : [],
  dir       : '' ,
  name      : 'Sin Archivo',
  lines     : 0 ,
  travel    : 0 ,
  segTotal  : 0
};
var arduino = {
  comName : Arduino.port.comName,
  manufacturer : Arduino.port.manufacturer,
  reSet : Arduino.reSet
};

function setFile ( dirfile , cb ) {
  if (dirfile){
    fs.readFile( dirConfig , "utf8", function (error, data) {
      let config = JSON.parse(data);
      File.workpiece.x = config.workpiece.x;
      File.workpiece.y = config.workpiece.y;
      File.scale       = config.scale;
      File.dir      = dirfile[0];
      File.gcode    = gc(fs.readFileSync(dirfile[0]).toString());
      File.name     = dirfile[0].split('/')[dirfile[0].split('/').length-1];
      File.lines    = File.gcode.length;
      File.travel   = File.gcode[File.gcode.length-1].travel;
      File.segTotal = File.gcode[File.gcode.length-1].travel * getMiliSeg();
      //return File;
      cb(File) ;
    });
  }
}

function sendCommand ( code , callback ){
  if(debug) console.log(`${__filename}\n sendCommand, code: ${code}`);
  if( Arduino.port.comName !== '' ){
    if( Arduino.port.isOpen() )    Arduino.port.close(); 
    Arduino.port.open( (err) => {
      Arduino.port.write(new Buffer(code+'\n'), (err) => {
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

function getPasos (l) {
  // falta la escala
  fs.readFile( dirConfig , "utf8", function (error, data) {
    let config = JSON.parse(data);
    let a = l!==0 ? File.gcode[l-1].ejes : File.gcode[l].ejes;
    let x = [0,0,0];
    let b = File.gcode[l].ejes;
    x[0] = Math.round((b[0]-a[0]) * config.motor.x.steps / config.motor.x.advance) * (config.motor.x.sense)? -1 : 1;
    x[1] = Math.round((b[1]-a[1]) * config.motor.y.steps / config.motor.y.advance) * (config.motor.y.sense)? -1 : 1;
    x[2] = Math.round((b[2]-a[2]) * config.motor.z.steps / config.motor.z.advance) * (config.motor.z.sense)? -1 : 1;
    return x;
  });
}

function start (nro,callback) {
  if( Arduino.port.comName !== '' ){
    if( Arduino.port.isOpen() ){ Arduino.port.close(); }
    if(Arduino.port.comName !== '' && File.gcode.length > 0){
      // arduino
      Arduino.port.open( (err) => {
        if( nro !== null){ // validar mejor :D
          Arduino.port.write(new Buffer(getPasos(nro)+'\n'), (err,results) => {
            Arduino.port.drain( () => {
              callback({ nro, result:'0,0,0' });
            })
          })//write
        }
        Arduino.port.on('data', (data) => {
        let result = data.toString().split(',');
        if(result[0]==0 && result[1]==0 && result[2]==0){
          nro++;
          if(nro < File.gcode.length){
            Arduino.port.write(new Buffer(getPasos(nro)+'\n'), (err,results) => {
              Arduino.port.drain( () => { callback({ nro , result }); });
            });//write
          }else{
            Arduino.port.close( (err) => {
              callback({ nro:false , result:['0','0','0'] });
            });//close
          }
        }else{//Pause
          Arduino.port.close( (err) => {
            //callback({ nro , result });
            console.log("Pause: %s",data);
          });//close
        }
        })//data
      });// open
    }
  }else{
    // error no esta ardu
  }
}

function saveConfig(arg , cb) {
  if(arg.iqualx){ arg.file.motor.y = arg.file.motor.x;}
  if(arg.save){
    fs.writeFile( dirConfig , JSON.stringify(arg.file) , (err) => {
      if (err) throw err;
      fs.readFile( dirConfig , "utf8", function (error, data) {
        cb( { file : JSON.parse(data) , message : 'Cambios guardados.'} );
      });
    });
  }else{
    fs.readFile( dirConfig , "utf8", function (error, data) {
      cb( { file : JSON.parse(data) } );
    });
  }
}

module.exports = {
  Arduino : arduino , File  , setFile , dirConfig , sendCommand , start , saveConfig
};