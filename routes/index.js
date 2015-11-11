var app = module.parent.exports.app,
  gc = require("./gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', gcode=[],
  motroXY = {pasos:1000,avance:23.45},
  motorZ = {pasos:1200,avance:0.40},
  SerialPort = serialPort.SerialPort;

app.io.route('connection', function(req) {});
/* GET listado de puertos. */
app.get('/portslist', function(req, res){
  serialPort.list(function (err, ports){
    if(ports==undefined){
      res.json([{manufacturer:"Sin Arduino",comName:''}]);
    }else{
      res.json(ports);
    }
  });
});

/* GET home page. */
app.get('/', function(req, res){
  res.render('index.jade', {titulo: "CNC Mar"});
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

app.get('/comando/:code', function (req, res) {
  console.log("GET -> /comando, %s",req.params.code);
  sp.open(function(err) {
    sp.drain(function(){});
    sp.write(new Buffer(req.params.code+'\n'),function(err) {
      req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Comando manual: "+req.params.code,pasos:''});
      sp.on('data',function(data){
        console.log("arduino termino: %s",data?'terminado':'');
        sp.close(function(err) {
          res.json(data);
        });//close
      });//data
    });//write
  });//open

});

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
    x[0] = Math.round((b[0]-a[0])*motroXY.pasos / motroXY.avance);
    x[1] = Math.round((b[1]-a[1])*motroXY.pasos / motroXY.avance);
    x[2] = Math.round((b[2]-a[2])*motorZ.pasos / motorZ.avance);
    return x;
  }
if(sp!=='' && gcode.length>0){
//var i= req.paramslineaInicual!=undefined?req.paramslineaInicual:0;
var i=0;
  sp.open(function(err){
    sp.on('data',function(d){
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
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Archivo cargado. lineas: "+gcode.length,pasos:''});
  res.json({lineas:gcode.length});
});

app.get('/chart', function(req, res){  res.render('chart.jade', {titulo: "Arduino"});});

app.post('/moverOrigen', function (req, res) {
  sp.write("o\n");
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:req.body.comando,pasos:''});
});
