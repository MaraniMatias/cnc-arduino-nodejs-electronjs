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
  if (!dirfile) return {};
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
 return {
    nro : '',
    type : 'none',
    ejes : [],
    steps : [],
    travel : '',
    code
  }
}

function sendCommand ( type , code ){
  console.log(`sendCommand, type: ${type}, code: ${code}`);
  if( Arduino.port.comName !== '' ){
  if( Arduino.port.isOpen() ){ Arduino.port.close(); }
  
  
  } else {
    console.log('sendCommand Arduino not selected');
  }
}

module.exports = {
  Arduino , File , setFile, Line
};

app.post('/comando', function (req, res) {
  console.log("GET -> /comando, tipo: %s, %s",req.body.tipo,req.body.code);
  if( sp.isOpen() ){ sp.close() }
  if(req.body.tipo=='steps'){
    var code = req.body.code.replace('[','').replace(']','').split(',');
    var ejes = [ // para mostrar en mm cuanto avansa
     code[0] * motorXY.advance / motorXY.steps,
     code[1] * motorXY.advance / motorXY.steps,
     code[2] * motorZ.advance / motorZ.steps
    ];
    start( ejes ,req.body.code,code);
  }else if(req.body.tipo=='mm'){
    var code = req.body.code.replace('[','').replace(']','').split(',');
    var steps = [ // para mostrar cuantos steps son eso mm
      Math.round(code[0] *(motorXY.steps/motorXY.advance)),
      Math.round(code[1] *(motorXY.steps/motorXY.advance)),
      Math.round(code[2] *(motorZ.steps/motorZ.advance))
      ]
    var pasosString=steps[0]+','+steps[1]+','+steps[2];
    start(code,pasosString,steps);
  }
  if(req.body.tipo==undefined){
    start('',req.body.code,'');
  }
  function start(ejes,code,steps){
    sp.open(function(err) {
      sp.write(new Buffer(code+'\n'),function(err) {
        req.io.broadcast('lineaGCode', {nro:'',type:'',ejes:ejes,code:"Comando manual: "+code, steps:steps,travel:''});
        sp.on('data',function(data){
          var d = data.toString().split(',');
          if(d[0]==0 && d[1]==0 && d[2]==0){
            sp.close(function(err) {
              console.log("arduino termino: %s",data);
              req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Terminado.',steps:'',travel:''});
            });//close
          }else{//Pause
            sp.close(function(err) {
              console.log("arduino en pausa: %s",data);
              req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Pausado.',steps:d,travel:''});
            });//close
          }
        });//data
          res.json('0');// este es para que no esper repuesta y evitar el re envio.
      });//write
    });//open
  }
});//post