'use strict'
const 
  debug = false,
  fs = require('fs'),
  gc = require("./gcode"),
  serialPort = require('serialport'),
  dirConfig = `${__dirname}/config.json`;
;
var lineRunning = 0;
var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet
};

function getMiliSeg (config)  {
  let steps   = ( config.motor.x.steps   + config.motor.y.steps   ) / 2;
  let time    = ( config.motor.x.time    + config.motor.y.time    ) / 2;
  let advance = ( config.motor.x.advance + config.motor.y.advance ) / 2;
  return steps * time / advance ;
}

var File = {
  workpiece : { x:300, y:400 },
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

function setFile ( dirfile ,initialLine, cb ) {
  if (dirfile){
    readConfig().then( (config) => {
      File.workpiece.x = config.workpiece.x;
      File.workpiece.y = config.workpiece.y;
      File.dir      = dirfile[0];
      File.gcode    = gc(fs.readFileSync(dirfile[0]).toString(),initialLine);
      File.name     = dirfile[0].split('/')[dirfile[0].split('/').length-1];
      File.lines    = File.gcode.length;
      File.travel   = File.gcode[File.gcode.length-1].travel;
      File.segTotal = File.gcode[File.gcode.length-1].travel * getMiliSeg(config);
      cb(File);
    });
  }
}
/**
 * @param  {String} code '0,0,0' or p or any
 * @param  {function} callback
 */
function sendCommand ( code , callback ){
  if(debug) console.log(`${__filename}\n sendCommand, code: ${code}`);
  if( Arduino.port.comName !== '' ){
    if( Arduino.port.isOpen() )    Arduino.port.close(); 
    Arduino.port.open( (err) => {
      Arduino.port.write(new Buffer(code+'\n'), (err) => {
        Arduino.port.drain( () => {
          Arduino.port.on('data', (data) => {
            Arduino.port.close( (err) => {
              if(debug){ console.log('respuesta: ',data); }
              if (typeof (callback) === 'function') {
                let result = data.toString().split(',');
                //if(result[0]==0 && result[1]==0 && result[2]==0) lineRunning = 0;
                console.log({ type:'none', line : lineRunning, steps :result })
                callback({ type:'none', line : lineRunning, steps :result });
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
  }
}

function reSet () {
  return new Promise(function (resolve, reject){
    serialPort.list( (err, ports) => {
      var comName = undefined;
      ports.forEach( (port) => {
        if(port.manufacturer !== undefined){
          console.log(`ComName: ${port.comName}\nPnpId: ${port.pnpId}\nManufacturer: ${port.manufacturer}`);
          comName = port.comName;
        }
      });// for
      if(comName !== undefined){
          Arduino.port = new serialPort.SerialPort(comName,{// ports.slice(-1)[0].comName;
            parser: serialPort.parsers.readline('\r\n'), dataBits: 8,
            baudrate:9600, parity: 'none', stopBits: 1, flowControl: false
          },false);// This does not initiate the connection.
          
          Arduino.port.open( (err) => {
            if(err){
              resolve({
                type : 'warning',
                msg  : 'Arduino detectado: '+Arduino.port.manufacturer+'.\nNo puedo abrir la conexión.\nPrueba con permisos de administrador (root en linux).'
              });
              console.log(`ComName: ${Arduino.port.comName}\nPnpId: ${Arduino.port.pnpId}\nManufacturer: ${Arduino.port.manufacturer}`);
              console.log('is err',err);
            }else{
              Arduino.port.close();
              resolve({
//                config : {},
                type : 'success',
                msg  : 'Arduino detectado: ' + Arduino.port.manufacturer
              });
              console.info('Puerto Selecionado %s',Arduino.port.manufacturer);
            }
          });// open port

        }else{
          Arduino.port = { comName : '' , manufacturer : ''};
          resolve({ type : 'error', msg  : 'No encontramos ardiono.'});
          console.warn('No Arduino.');
        }
        
    });
  })// promise
}
     
function getSteps (l,oldSteps,config) {
  let a = l!==0 ? File.gcode[l-1].ejes : File.gcode[l].ejes;
  let x = [0,0,0];
  let b = File.gcode[l].ejes;
  x[0] = Math.round((b[0]-a[0]) * config.motor.x.steps / config.motor.x.advance) -oldSteps[0];//* (config.motor.x.sense)? -1 : 1;
  x[1] = Math.round((b[1]-a[1]) * config.motor.y.steps / config.motor.y.advance) -oldSteps[1];//* (config.motor.y.sense)? -1 : 1;
  x[2] = Math.round((b[2]-a[2]) * config.motor.z.steps / config.motor.z.advance) -oldSteps[2];//* (config.motor.z.sense)? -1 : 1;
  return x;
}

function start (arg,callback) {
  if(!arg.follow){ lineRunning=0;}
  let fileRead = new Promise(function (resolve, reject){
    fs.readFile( dirConfig , "utf8", function (error, data) {
      resolve(JSON.parse(data));
    });
  }).then( (config) => {
    if( Arduino.port.comName !== '' ){
      if( Arduino.port.isOpen() ){ Arduino.port.close(); }
      if(Arduino.port.comName !== '' && File.gcode.length > 0){
        Arduino.port.open( (err) => {
          if(err){
            console.log('It needs to be administrator.');
            console.log('sudo chmod 0777 /dev/'+Arduino.port.comName);
          } else {
            Arduino.port.write(new Buffer(getSteps(lineRunning,arg.steps,config)+'\n'), (err,results) => {
              Arduino.port.drain( () => {
                callback({ lineRunning, steps:'0,0,0' });
              })
            })//write
            
            Arduino.port.on('data', (data) => {
              let result = data.toString().split(',');
              lineRunning++;
              if(lineRunning < File.gcode.length){
                Arduino.port.write(new Buffer(getSteps(lineRunning,arg.steps,config)+'\n'), (err,results) => {
                  Arduino.port.drain( () => { 
                    callback({ lineRunning , steps:result });
                  });
                });//write
              }else{// finsh
                Arduino.port.close( (err) => {
                  callback({ lineRunning : false, steps:['0','0','0'] });
                  lineRunning = 0;
                });//close
              }
            })//data
          }//else
        });//open
      }
    }// if arduino != ''
  });
}

function saveConfig(data , cb) {
  fs.writeFile( dirConfig , JSON.stringify(data),{encoding:'utf8'} , (err) => {
    if (err) throw err;
    readConfig().then( (file) => {
      cb( { file , message : 'Cambios guardados.'} );
    });
  });
}

function readConfig() {
  return new Promise(function (resolve, reject){
    fs.readFile( dirConfig , "utf8", function (error, data) {
      if(error) throw error;
      resolve(JSON.parse(data));
    });
  })
}

module.exports = {
  Arduino : arduino , File  , setFile , sendCommand , start , configFile:{ dir:dirConfig,read:readConfig, save:saveConfig}
};