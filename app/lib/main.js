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

function setFile (dirfile) {
  if (!dirfile) return {};
  var data = fs.readFileSync(dirfile[0]);
  var fileContent = data.toString();
  
  File.dir = dirfile[0];
  File.gcode = gc(fileContent);
  File.name = dirfile[0].split('/')[dirfile[0].split('/').length-1];
  File.lines = File.gcode.length;
  File.travel = File.gcode[File.gcode.length-1].travel;
  File.segTotal = File.gcode[File.gcode.length-1].travel * getMiliSeg();
  return File;
  //cb(File) ;
}

function Line(code) {
  var line = {
    nro : '',
    type : 'none',
    ejes : [],
    steps : [],
    travel : '',
    code
  }
  return line
}

module.exports = {
  Arduino , File , setFile, Line
};