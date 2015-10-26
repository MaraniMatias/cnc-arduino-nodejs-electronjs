var app = module.parent.exports.app,
  async    = require("async"),
  gc = require("interpret-gcode"),
  fs = require('fs'),
  serialPort = require("serialport"),
  sp = '', sendData = "",  gcode='',
  motor = {paos:200,avance:2.5},
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

app.get('/comenzar', function(req, res){
  var indexLinea = 0;
  console.log("Cordenadas: %s",gcode[indexLinea].ejes);


/*
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

  res.json({rta:'ok'});
});

app.post('/cargar', function (req, res) {
  var tmp_path = req.files.file.path;
  //var nombreArchivo = req.files.file.name;
  //var target_path='./public/files/'+nombreArchivo;
  var data = fs.readFileSync(tmp_path);
  var fileContent = data.toString();
  var history = gc(fileContent);
  gcode = [];

  async.mapSeries(history, function(doc,done){
    gcode.push({ejes:doc.x,code:doc.code});
    done();
  },function(){
    console.log(gcode);
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


///----
var clients=[]; //record all clients
var client=function(username,socket){
  this.username=username;
  this.socket=socket;
}


app.io.on('connection',function(socket){
  //console.log('a user connected.');
  socket.on('disconnect',function(){
    console.log('user disconnected');
    removeSocket(socket);
  });

  socket.on('chat message',function(msg){
    console.log('from socket' +socket.id);
    console.log('message: ' + msg.txt + ' from ' + msg.from + ' to ' + msg.to);
    if(clients.indexOf(socket)<=-1){
      clients.push(new client(msg.from,socket)); // add new client
    }
    var skt=findSocketByUser(msg.to);
    if(skt!==null) {
      console.log('socket' +socket.id + ' skt ' +skt.id);
      skt.emit('chat message', msg); //socket is only for that socket, io will broadcast
    }
  });

  socket.on('sign up',function(user){
    console.log('on sign up from '+ user);
    var skt=findSocketByUser(user);
    if(skt===null)
      clients.push(new client(user,socket));
    return;
  });

});

function removeSocket(socket){
  for(var i=0;i<clients.length;i++){
    if(clients[i].socket==socket){
      clients.splice(i,1);//remove this client
    }
  }
}

function findSocketByUser(user){
  for(var i=0;i<clients.length;i++){
    if(clients[i].username==user){
      return clients[i].socket;
    }
  }
  return null;
}