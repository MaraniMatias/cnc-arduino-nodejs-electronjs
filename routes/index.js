var app = module.parent.exports.app,
  async    = require("async"),
  gc = require("interpret-gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', sendData = "", motor = {paos:200,avance:2.5},
  SerialPort = serialPort.SerialPort;

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
    res.json({status:data});
  });
});

app.post('/moverOrigen', function (req, res) {
  sp.write("o\n");
  sp.on('data', function(data) {
    res.json({status:data});
  });
});

app.post('/conect', function (req, res) {
  if(req.body.comUSB!=''){
    sp = new SerialPort(req.body.comUSB/*,{dataBits: 8,parity: 'none',stopBits: 1,flowControl: false}*/);
    sp.on("open", function () {/*console.log('GET: /conect -> open');*/});
  }
  res.json({status:req.body.comUSB});
});


app.post('/cargarGCODE', function (req, res) {
  var tmp_path = req.files.file.path;
  //var nombreArchivo = req.files.file.name;
  //var target_path='./public/files/'+nombreArchivo;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  var history = gc(fileContent);
  var gcode = [];

  async.mapSeries(history, function(doc,done){
    gcode.push({ejes:doc.x,code:doc.code});
    done();
  },function(){
    res.json(gcode);
  });

/*
  var indexLinea = 0;
  console.log("Cordenadas: %s",history[indexLinea].x);
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