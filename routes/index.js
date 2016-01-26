var app = module.parent.exports.app,
  gc = require("./gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', gcode=[],
  motorXY = {
    time:24,
    steps:10000,
    advance:115.47,
    getMiliSeg : function(){
      return   this.steps * this.time / this.advance ;
    }
  },// medidas en mm
  motorZ = {steps:2000,advance:7.00},// medidas en mm
  SerialPort = serialPort.SerialPort;

app.io.route('connection', function(req) {
//  req.io.emit('canvas', {x:200,y:320});
//  req.io.emit('canvas', {x:230,y:120,end:true});
});

/* GET listado de puertos. */

app.get('/portslist', function(req, res){
  serialPort.list(function (err, ports){
    if(ports!=undefined && ports.length > 0){
      sp = new SerialPort(ports.slice(-1)[0].comName,{
        parser: serialPort.parsers.readline("\n"),
        dataBits: 8, baudrate:9600, parity: 'none',
        stopBits: 1, flowControl: false
      },false);// para que no abra la conecion al crear
      console.log("Puerto Selecionado %s",ports.slice(-1)[0].comName);
      res.json({'ports':ports,'portSele':ports.slice(-1)[0]});
    }else{
      res.json({'ports':[{manufacturer:"Sin Arduino",comName:''}],'portSele':undefined});
    }
  });
});


/* GET home page. */
app.get('/', function(req, res){
  res.render('index.jade', {titulo: "CNC Mar",motorXY:motorXY});
});

app.post('/conect', function (req, res) {
  console.log("POST -> /conect");
  if(req.body.comUSB!=''){
    sp = new SerialPort(req.body.comUSB,{
      parser: serialPort.parsers.readline("\n"),
      dataBits: 8, baudrate:9600, parity: 'none',
      stopBits: 1, flowControl: false
    },false);// para que no abra la conecion al crear
    console.log("Puerto Selecionado %s",req.body.comUSB);
    req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino conectado por puerto "+req.body.comUSB,steps:''});
    res.json(true);
   }
});

app.post('/comando', function (req, res) {
  //console.log("GET -> /comando, %s",req.params.code);
  console.log("GET -> /comando, tipo: %s, %s",req.body.tipo,req.body.code);
  //req.body.tipo // si es undefined comando directo
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
    var pasosString='['+steps[0]+','+steps[1]+','+steps[2]+']'
    start(code,pasosString,steps);
  }
  if(req.body.tipo==undefined){
    start('',req.body.code,'');
  }
  function start(ejes,code,steps){
    sp.open(function(err) {
      sp.drain(function(){});
      sp.write(new Buffer(code+'\n'),function(err) {
        req.io.broadcast('lineaGCode', {nro:'',ejes:ejes,code:"Comando manual: "+code, steps:steps});
        sp.on('data',function(data){
          if(data==0){
            sp.close(function(err) {
              console.log("arduino termino: %s",data);
              //req.io.broadcast('closeConex', {close:true});
              req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Terminado.',steps:'',travel:''});
            });//close
          }
        });//data
          res.json('0');// este es para que no esper repuesta y evitar el re envio.
      });//write
    });//open
  }
});//post

app.get('/comenzar', function(req, res){
  console.log("GET -> /comenzar")
  function getPasos(l){
    if(l!==0){
      var a = gcode[l-1].ejes
    }else{
      var a = gcode[l].ejes;
    }
    var x=[0,0,0],b = gcode[l].ejes;
    //console.log("B: %s - A: %s = ",b,a);
    x[0] = Math.round((b[0]-a[0])*motorXY.steps / motorXY.advance);
    x[1] = Math.round((b[1]-a[1])*motorXY.steps / motorXY.advance);
    x[2] = Math.round((b[2]-a[2])*motorZ.steps / motorZ.advance);
    return x;
  }
if(sp!=='' && gcode.length>0){
//var i= req.paramslineaInicual!=undefined?req.paramslineaInicual:0;
var i=0;
  sp.open(function(err){
    sp.on('data',function(data){
    if(data==0){
      i++;
      if(i<gcode.length){
        sp.write(new Buffer(getPasos(i)+'\n'),function(err,results){
          console.log("I: %s - Cordenadas: %s",i,gcode[i].ejes);
          req.io.broadcast('lineaGCode', {
            nro:i,
            ejes:gcode[i].ejes,
            code:gcode[i].code,
            steps:getPasos(i),
            travel:gcode[i].travel
          });
        });//write
      }else{
        sp.close(function(err){
          console.log("Terminado.");
          req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Terminado.',steps:'',travel:''});
        });//close
      }
    }
    });
    sp.drain(function(){});
    sp.write(new Buffer(getPasos(i)+'\n'),function(err,results){
      console.log("I: %s - Cordenadas: %s",i,gcode[i].ejes);
      req.io.broadcast('lineaGCode', {
        nro:i,
        ejes:gcode[i].ejes,
        code:gcode[i].code,
        steps:getPasos(i),
        travel:gcode[i].travel
        });
    });//write
  });//open
  res.json({segTotal:gcode[gcode.length-1].travel*motorXY.getMiliSeg()});// en milisegundos
}else{
  req.io.broadcast('lineaGCode', {nro:'',type:'negative',ejes:'',code:"Selecione el arduino.",steps:''});
  res.json(false);
}
});

app.post('/cargar', function (req, res) {
  console.log("POST -> /cargar");
  var tmp_path = req.files.file.path;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  gcode = gc(fileContent);
/*
  req.io.broadcast('canvas', {x:0,y:0,z:0,end: false,cleaner:true });
  for (var index = 0; index < gcode.length; index++) {
    var line = gcode[index];
    req.io.broadcast('canvas', {x:line.ejes[0],y:line.ejes[1],z:line.ejes[2],end: index+1 == gcode.length });
  }
*/

  req.io.broadcast('lineaGCode', {nro:'',type:'',ejes:'',code:"Archivo cargado.",steps:''});
  res.json({
    segTotal : gcode[gcode.length-1].travel * motorXY.getMiliSeg(),
    lineas   : gcode.length,
    travel   : gcode[gcode.length-1].travel
    });
});

app.get('/chart', function(req, res){
//  res.render('chart.jade', {titulo: "Arduino"});

});