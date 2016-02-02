const
  serialPort = require('serialport')
;
var Arduino = {
  port : { comName : '' , manufacturer : ''},
  reSet
};

function reSet () {
  serialPort.list( (err, ports) => {
    if(ports && ports.length > 0){
      Arduino.port = new serialPort.SerialPort(ports.slice(-1)[0].comName,{
        parser: serialPort.parsers.readline('\r\n'),
        dataBits: 8, 
        baudrate:9600,
        parity: 'none',
        stopBits: 1,
        flowControl: false
      },false);// This does not initiate the connection.
      console.log('Puerto Selecionado %s',ports.slice(-1)[0].manufacturer);
      return true
    }else{
      Arduino.port = { comName : '' , manufacturer : ''};
      console.log('No Arduino.');
      return false
    }
  });
}

function sendCommand ( code ) {
  sp.open( (err) => {
    sp.write(new Buffer(code+'\n'), (err) => {
      sp.drain( () => {      
        //req.io.broadcast('lineaGCode', {nro:'',type:'',ejes:ejes,code:"Comando manual: "+code, steps:steps,travel:''});
        sp.on('data', (data) => {
          var d = data.toString().split(',');
          if ( d[0]==0 && d[1]==0 && d[2]==0 ) {
            sp.close( (err) => {
              console.log("arduino termino: %s",data);
              //req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Terminado.',steps:'',travel:''});
            });//close
          } else {//Pause
            sp.close( (err) => {
              console.log("arduino en pausa: %s",data);
              //req.io.broadcast('closeConex', {nro:'',type:'',ejes:'',code:'Pausado.',steps:d,travel:''});
            });//close
          }
        });//data
      });// drain
res.json('0');// este es para que no esper repuesta y evitar el re envio.
    });//write
  });//open
}

// ########################################################### //
module.exports = Arduino;
