var app = module.parent.exports.app,
  async    = require("async"),
  gc = require("interpret-gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', sendData = "",  gcode='',
  motor = {paos:200,avance:2.5},
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

app.post('/comando', function (req, res) {
  sp.write(req.body.comando+"\n");
  sp.on('data', function(data) {
    req.io.broadcast('lineaGCode', {nro:0,ejes:'',code:req.body.comando});
  });
});

app.post('/moverOrigen', function (req, res) {
  sp.write("o\n");
  sp.on('data', function(data) {
    req.io.broadcast('lineaGCode', {nro:0,ejes:'',code:req.body.comando});
  });
});

app.post('/conect', function (req, res) {
  if(req.body.comUSB!=''){
    sp = new SerialPort(req.body.comUSB/*,{dataBits: 8,parity: 'none',stopBits: 1,flowControl: false}*/);
    sp.on("open", function () {
    req.io.broadcast('lineaGCode', {nro:'',ejes:'',code:"Arduino conectado por puerto "+req.body.comUSB});
  });
  }
});

app.get('/comenzar', function(req, res){
  var indexLinea = 0;

  for (var i = 0; i < gcode.length; i++) {
  //for (var i = 0; i < gcode.length; i++) {
    console.log(gcode[i].ejes);
    req.io.broadcast('lineaGCode', {nro:i,ejes:gcode[i].ejes,code:gcode[i].code});
  };

/*
  console.log("Cordenadas: %s",gcode[indexLinea].ejes);
  sp.write(history[indexLinea].x+"\n");
  sp.on('data', function(data){
    console.log('\t Arduino envia "%s"',data);
    if(indexLinea < history.length) {
      console.log("Cordenadas: %s",history[indexLinea].x);
      sp.write(history[indexLinea].x+"\n", function(err, results) {
        if(err){console.log('err ' + err);}
      });
      indexLinea++
    }
  });
*/
});

app.post('/cargar', function (req, res) {
  var tmp_path = req.files.file.path;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  var history = gc(fileContent);

  gcode = [];
  async.mapSeries(history, function(doc,done){
    gcode.push({ejes:doc.x,code:doc.code});
    done();
  },function(){
    res.json({lineas:gcode.length});
  });

});



/*
//serialListener();
app.io.on('connection', function (socket) {
  console.log("user connected");
  socket.emit('onconnection', {pollOneValue:sendData});
  app.io.on('update', function(data) {
  socket.emit('updateData',{pollOneValue:data});
  });
  socket.on('buttonval', function(data) {
    sp.write(data + 'E');
  });
  socket.on('sliderval', function(data) {
    sp.write(data + 'P');
  });
});


// Listen to serial port
function serialListener(){
    var receivedData = "";
    sp = new SerialPort(portName, {
        baudrate: 9600,
        // defaults for Arduino serial communication
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });

    sp.on("open", function () {
      console.log('open serial communication');
            // Listens to incoming data
        sp.on('data', function(data) {
            console.log('data received: ' + data);
            receivedData += data.toString();
          if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) {
            sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
            receivedData = '';
         }
         // send the incoming data to browser with websockets.
       app.io.emit('update', sendData);
      });

    });
}
*/

//app.get('/chart', function(req, res){  res.render('chart.jade', {titulo: "Arduino"});});