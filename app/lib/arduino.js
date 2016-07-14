const
  SerialPort = require('serialport')
;
var
  manufacturer  =  sp? sp.manufacturer:"Sin Arduino.",
  comName       =  sp? sp.comName:"",
  working       =  false,
  log           =  true,
  sp            =  undefined,
  onData        =  function(data){console.log('Data: ' + data);},
  onOpen        =  function(err){console.log('Open.');},
  onClose       =  function(){console.log('Close.');},
  onError       =  function(err){console.log('Error: ', err.message);},
  onDisco       =  function(){console.log('Disconnect.');},
  option        =  {
    parser      :  SerialPort.parsers.readline('\r\n'), 
    autoOpen    :  false,
    dataBits    :  8, 
    baudrate    :  115200,
    parity      :  'none',
    stopBits    :  1,
    flowControl :  true
  }
;
/**
 * Listado de puertos encontrados.
 *
 * @param {function} callback: (ports: port[]) => void
 */
function list(callback){
  let ardu = [];
  SerialPort.list( function (err, ports) {
    ports.forEach(function(port) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined){
        ardu.push(port);
      }
    });
    callback(ardu);
  });
}

function search(callback) {
  SerialPort.list( function (err, ports) {
    ports.forEach(function(port) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined){
        comName = port.comName;
        manufacturer = port.manufacturer;
        if(log)console.log(`SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}\n`);
        callback(port.comName);
      }
    });
  });
}

function newArduino(comName) {
  sp = new SerialPort(comName,option);
  sp.on('open'  , onOpen );
  sp.on('error' , onError );
  sp.on('data'  , onData );
  sp.on('close' , onClose );
  sp.on('disconnect', onDisco );
}

function send(code , callback){
  if( sp.isOpen() ){  write( code , callback );  }
  else{  sp.open( (err) => { write( code , callback ); });  }
}
function write(code , callback){
  if(log)console.log("write:\n\tCode:",code);
  sp.write(new Buffer(code+'\n'), (err) => {
    if(err) throw err
    sp.drain( callback() );
  });
}

/**
 * Set automaticamente con el primer puerto encontrado
 * 
 * @param {function} callback: (ports: port[]) => void
 */
function set(callback) {
  search( (comName) => {
    newArduino(comName);
    callback( comName , manufacturer );
  });
}

module.exports = {
  set,
  send,
//  list,
  search,
//  log,
  working,
  manufacturer,
  comName,
  onData,
  onError,
  onOpen
}