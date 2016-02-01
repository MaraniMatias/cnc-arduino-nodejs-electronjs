const 
  fs = require('fs'),
  gc = require("./gcode"),
  arduino = require('./arduino.js'),
  config  = require('./config.json')
;

function getMiliSeg ()  {
  return config.motor.xy.steps * config.motor.xy.time / config.motor.xy.advance ;
}

var file = {
  gcode   : [],
  dir     : '' ,
  name    : 'Sin Archivo',
  lines   : 0 ,
  travel    : 0 ,
  segTotal  : 0
}

function setFile (dirfile) {
  var data = fs.readFileSync(dirfile[0]);
  var fileContent = data.toString();
  
  file.dir = dirfile[0];
  file.gcode = gc(fileContent);
  file.name = dirfile[0].split('/')[dirfile[0].split('/').length-1];
  file.lines = file.gcode.length;
  file.travel = file.gcode[file.gcode.length-1].travel;
  file.segTotal = file.gcode[file.gcode.length-1].travel * getMiliSeg();
  return file;
  //cb(file) ;
}

module.exports = {
  arduino , file , setFile
};