const 
  fs = require('fs'),
  gc = require("./gcode"),
  Arduino = require('./arduino.js'),
  config  = require('./config.json')
;

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
}

function setFile ( dirfile ) {
  if (!dirfile){ return {};}
  File.dir = dirfile[0];
  File.gcode = gc(fs.readFileSync(dirfile[0]).toString());
  File.name = dirfile[0].split('/')[dirfile[0].split('/').length-1];
  File.lines = File.gcode.length;
  File.travel = File.gcode[File.gcode.length-1].travel;
  File.segTotal = File.gcode[File.gcode.length-1].travel * getMiliSeg();
  return File;
  //cb(File) ;
}

function Line (code) {
  return { nro : '', type : 'none', ejes : [], steps : [], travel : '', code }
}
Line.prototype._clone = (code) => {
  return {  code : Line(code), nro : this.nro, type : this.type, ejes : this.ejes, steps : this.steps, travel : this.travel }
}

function sendCommand ( type , code ){
  console.log(`sendCommand, type: ${type}, code: ${code}`);
  if( Arduino.port.comName !== '' ){
    var line;
    switch (type) {
      case 'steps':
        line = Line(`Comando manual ${type}: ${code}`);
        line.steps = code.split(',');
        line.ejes = [
          line.steps[0] * config.motor.xy.advance / config.motor.xy.steps,
          line.steps[1] * config.motor.xy.advance / config.motor.xy.steps,
          line.steps[2] * config.motor.z.advance  / config.motor.z.steps
        ];
        realSendCommand( code , line );
        break;
      case 'mm':
        line = Line(`Comando manual ${type}: ${code}`);
        line.ejes = code.split(',');
        line.steps = [
          Math.round(line.ejes[0] * (config.motor.xy.steps / config.motor.xy.advance)),
          Math.round(line.ejes[1] * (config.motor.xy.steps / config.motor.xy.advance)),
          Math.round(line.ejes[2] * (config.motor.z.steps  / config.motor.z.advance))
        ];
        realSendCommand( line.steps[0]+','+line.steps[1]+','+line.steps[2] , line );
        break;
      default:
        realSendCommand( code , line );
        break;
    }
  } else {
    console.error('sendCommand Arduino not selected');
    throw new Error('Arduino no seleccionado');
  }
}

function realSendCommand( code , line ){
  //req.io.broadcast('lineaGCode', line ); // emitir enviar lines procesada a app.js
  // pasar code a arduino.js
  Arduino.sendCommand( code , ( dataReceived ) => {
    var d = dataReceived.split(',');
    if(d[0]===0 && d[1]===0 && d[2]===0){
      // arduino al terminar para aca y ese a app.js
      //req.io.broadcast('closeConex', line._clone('Terminado') );
    }else{//Pause
      // arduino al terminar para aca y ese a app.js
      //req.io.broadcast('closeConex', line._clone('Pausado') );
    }
  });
}

module.exports = {
  Arduino , File , Line , setFile , sendCommand
};