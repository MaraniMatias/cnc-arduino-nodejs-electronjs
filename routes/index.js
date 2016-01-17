var app = module.parent.exports.app,
  gc = require("./gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', gcode=[],
  motorXY = {pasos:10000,avance:115.47},// medidas en mm
  motorZ = {pasos:2000,avance:7.00},// medidas en mm
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
      //req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino conectado por puerto "+ports.slice(-1)[0].comName,pasos:''});
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
    req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino conectado por puerto "+req.body.comUSB,pasos:''});
    res.json(true);
   }
});

//app.get('/comando/:code', function (req, res) {
app.post('/comando', function (req, res) {
  //console.log("GET -> /comando, %s",req.params.code);
  console.log("GET -> /comando, tipo: %s, %s",req.body.tipo,req.body.code);
  //req.body.tipo // si es undefined comando directo
  if(req.body.tipo=='pasos'){
    var code = req.body.code.replace('[','').replace(']','').split(',');
    var ejes = [ // para mostrar en mm cuanto avansa
     code[0] * motorXY.avance / motorXY.pasos,
     code[1] * motorXY.avance / motorXY.pasos,
     code[2] * motorZ.avance / motorZ.pasos
    ];
    start( ejes ,req.body.code,code);
  }else if(req.body.tipo=='mm'){
    var code = req.body.code.replace('[','').replace(']','').split(',');
    var pasos = [ // para mostrar cuantos pasos son eso mm
      Math.round(code[0] *(motorXY.pasos/motorXY.avance)),
      Math.round(code[1] *(motorXY.pasos/motorXY.avance)),
      Math.round(code[2] *(motorZ.pasos/motorZ.avance))
      ]
    var pasosString='['+pasos[0]+','+pasos[1]+','+pasos[2]+']'
    start(code,pasosString,pasos);
  }
  if(req.body.tipo==undefined){
    start('',req.body.code,'');
  }
  function start(ejes,code,pasos){
    sp.open(function(err) {
      sp.drain(function(){});
      sp.write(new Buffer(code+'\n'),function(err) {
        req.io.broadcast('lineaGCode', {nro:'',ejes:ejes,code:"Comando manual: "+code, pasos:pasos});
        sp.on('data',function(data){
        if(data==0){
          console.log("arduino termino: %s",data?'terminado':'');
          sp.close(function(err) {
            //res.json(data); // enviar con socek.io
            req.io.broadcast('closeConex', {close:true});
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
    x[0] = Math.round((b[0]-a[0])*motorXY.pasos / motorXY.avance);
    x[1] = Math.round((b[1]-a[1])*motorXY.pasos / motorXY.avance);
    x[2] = Math.round((b[2]-a[2])*motorZ.pasos / motorZ.avance);
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
          req.io.broadcast('lineaGCode', {nro:i,ejes:gcode[i].ejes,code:gcode[i].code,pasos:getPasos(i)});
        });//write
      }else{
        sp.close(function(err){
          console.log("Terminado.");
          req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:'Terminado.',pasos:''});
        });//close
      }
    }
    });
    sp.drain(function(){});
    sp.write(new Buffer(getPasos(i)+'\n'),function(err,results){
        console.log("I: %s - Cordenadas: %s",i,gcode[i].ejes);
        req.io.broadcast('lineaGCode', {nro:i,ejes:gcode[i].ejes,code:gcode[i].code,pasos:getPasos(i)});
    });//write
  });//open

  res.json(true);
}else{
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Selecione el arduino.",pasos:''});
  res.json(false);
}
});

app.post('/cargar', function (req, res) {
  console.log("POST -> /cargar");
  var tmp_path = req.files.file.path;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  gcode = gc(fileContent);
  
  req.io.broadcast('canvas', {x:0,y:0,end: false,cleaner:true });
  for (var index = 0; index < gcode.length; index++) {
    var line = gcode[index];
    req.io.broadcast('canvas', {x:line.ejes[0],y:line.ejes[1],end: index+1 == gcode.length });
  }
  
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Archivo cargado. lineas: "+gcode.length,pasos:''});
  res.json({lineas:gcode.length});
});

app.get('/chart', function(req, res){
//  res.render('chart.jade', {titulo: "Arduino"});

});

app.post('/moverOrigen', function (req, res) {
  sp.write("o\n");
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:req.body.comando,pasos:''});
});
