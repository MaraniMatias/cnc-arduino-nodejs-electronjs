var app = module.parent.exports.app,
  async    = require("async"),
  gc = require("interpret-gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '',  gcode='', cleanData = '', readData = ''
  motor = {pasos:200,avance:0.025},
  SerialPort = serialPort.SerialPort;


app.io.route('connection', function(req) {});
/* GET listado de puertos. */
app.get('/portslist', function(req, res){
  serialPort.list(function (err, ports){
    if(ports==undefined){
     res.json([{manufacturer:"Sin Arduino",comName:''}]);
    }else{res.json(ports);}
  });
});

/* GET home page. */
app.get('/', function(req, res){
  res.render('index.jade', {titulo: "CNC Mar",sp:sp.path});
});

app.post('/conect', function (req, res) {
  console.log("Post -> /conect");
  if(req.body.comUSB!=''){
    sp = new SerialPort(req.body.comUSB,{
      //dataBits: 8,
      baudrate:9600,
      parity: 'none',
      //stopBits: 1,
      flowControl: false
    });
    sp.on("open", function () {
       console.log("Puerto Selecionado %s",req.body.comUSB);
       req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino conectado por puerto "+req.body.comUSB,pasos:''});
    });
   }
});

app.post('/comando', function (req, res) {
  console.log("Post -> /comando, %s",req.body.comando);
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Comando manual: "+req.body.comando,pasos:''});
  sp.write(req.body.comando+"\n");
  sp.on('data', function (data) {
    readData += data.toString();
    if (readData.indexOf('B') >= 0 && readData.indexOf('A') >= 0) {
    cleanData = readData.substring(readData.indexOf('A') + 1, readData.indexOf('B'));
    readData = '';
    req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino imprime: "+cleanData,pasos:''});
    }
  });
});

app.get('/comenzar', function(req, res){
  console.log("GET -> /comenzar")
  function getPasos(i){
    if(i!==0){var a = gcode[i-1].ejes}else{var a = gcode[i].ejes;}
    var x=[0,0,0],b = gcode[i].ejes;
    //console.log("B: %s - A: %s = ",b,a);
    x[0] = Math.round((b[0]-a[0])*motor.pasos / motor.avance);
    x[1] = Math.round((b[1]-a[1])*motor.pasos / motor.avance);
    x[2] = Math.round((b[2]-a[2])*motor.pasos / motor.avance);
    return x;
  }
if(sp!==''){

/*
  for (var i = 0; i < gcode.length; i++) {//gcode.length
    console.log("x: %s",getPasos(i));
    req.io.broadcast('lineaGCode', {nro:i,ejes:gcode[i].ejes,code:gcode[i].code,pasos:getPasos(i)});
  };
*/

  console.log("I: 0 - Cordenadas: %s",gcode[0].ejes);
  req.io.broadcast('lineaGCode', {nro:0,ejes:gcode[0].ejes,code:gcode[0].code,pasos:getPasos(0)});
  sp.write(getPasos(0)+"\n",function(err, results) {});

  var i = 0;
  sp.on('data', function(data){
    console.log('\t Arduino envia "%s"',data);
    i++;
    if(i < gcode.length){
      console.log("I: %s - Cordenadas: %s",i,gcode[i].ejes);
      req.io.broadcast('lineaGCode', {nro:i,ejes:gcode[i].ejes,code:gcode[i].code,pasos:getPasos(i)});
      sp.write(getPasos(i)+"\n",function(err, results) {if(err){console.log('err ' + err);}});
    }else{
      console.log("termine :D")
      req.io.broadcast('lineaGCode', {nro:i,ejes:'',code:"Terminad :D",pasos:''});
    }
  });


}else{
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Selecione el arduino",pasos:''});
}
});

app.post('/cargar', function (req, res) {
  console.log("POST -> /cargar");
  var tmp_path = req.files.file.path;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  var history = gc(fileContent);

  gcode = [];
  async.mapSeries(history, function(doc,done){
    gcode.push({ejes:doc.x,code:doc.code});
    done();
  },function(){
    req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Archivo cargado.",pasos:''});
    res.json({lineas:gcode.length});
  });

});



app.get('/chart', function(req, res){  res.render('chart.jade', {titulo: "Arduino"});});

app.post('/moverOrigen', function (req, res) {
  sp.write("o\n");
  sp.on('data', function(data) {});
  req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:req.body.comando,pasos:''});
});