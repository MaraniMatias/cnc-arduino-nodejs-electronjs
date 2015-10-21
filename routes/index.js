var app = module.parent.exports.app;
var serialPort;
var portName = '/dev/ttyACM0'; //change this to your Arduino port
var sendData = "";
var SerialPort = require("serialport").SerialPort;

/* GET home page. */
app.get('/', function(req, res){
  res.render('index.jade', { titulo: "Arduino" });
});

app.io.on('connection', function (socket) {
  console.log("user connected");
  socket.emit('onconnection', {pollOneValue:sendData});
  app.io.on('update', function(data) {
  socket.emit('updateData',{pollOneValue:data});
  });
  socket.on('buttonval', function(data) {
    serialPort.write(data + 'E');
  });
  socket.on('sliderval', function(data) {
    serialPort.write(data + 'P');
  });
});
serialListener();

//app.io.route('ready', function(req,res) {
//  console.log(req.socket.id);
//  req.io.respond({
//    header  : 'Socket.io',
//    success : 'Hola biembenido desde la app.js'
//  })
//})

function listPort(){
  serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
}


// Listen to serial port
function serialListener()
{
    var receivedData = "";
    serialPort = new SerialPort(portName, {
        baudrate: 9600,
        // defaults for Arduino serial communication
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });

    serialPort.on("open", function () {
      console.log('open serial communication');
            // Listens to incoming data
        serialPort.on('data', function(data) {
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
