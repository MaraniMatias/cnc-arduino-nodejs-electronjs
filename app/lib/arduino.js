const
  serialPort = require('serialport'),
  debug = {
    write: true,
    sendGcode: false,
    search: false,
    isOpen: false,
    comName: false,
    send: false,
    on: false
  };
var
  manufacturer = sp ? sp.manufacturer : "Sin Arduino.",
  comName = sp ? sp.comName : "",
  working = false,
  sp,
  workingGCode = false,
  onData = function (data) {
    if (debug.on) console.log('Data: ' + data);
    working = false;
    let result = data.toString().split(',');
    if (debug.on) console.log({ type: 'none', steps: result });
    if (typeof (cb) === 'function') {
      cb({ type: "none", steps: result, msg: "Respuesta Arduino: " + result });
    }
  },
  onOpen = function (err) {
    if (err) console.log("Arduino detectado: " + manufacturer + ". No puedo abrir la conexión. Prueba con permisos de administrador (root en linux).");
    if (debug.on) console.log("Open.");
  },
  onClose = function () { if (debug.on) console.log('Close.'); },
  onError = function (err) { console.log('Error: ', err.message); },
  onDisco = function () { if (debug.on) console.log('Disconnect.'); },
  option = {
    parser: serialPort.parsers.readline('\r\n'),
    autoOpen: false,
    baudrate: 9600,
    parity: 'none',
    flowControl: false,
    lock: true, // Impedir que otros procesos de abrir el puerto
    bufferSize: 65536
  },
  cb = function (data) { console.log("default:", data) }
  ;
/**
 * Listado de puertos encontrados.
 *
 * @param {function} callback: (ports: port[]) => void
 */
function list(callback) {
  let ardu = [];
  serialPort.list(function (err, ports) {
    ports.forEach(function (port) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined) {
        ardu.push(port);
      }
    });
    callback(ardu);
  });
}
function factoryMsg(type, msg) {
  if (debug.msg) console.log(nro, type, msg);
  return { type, msg: type === 'open' && process.platform !== "linux" ? "It needs to be administrator. puerto " + comName : "sudo chmod 0777 /dev/" + comName || msg, ard: { comName, manufacturer } }
}

function search(callback) {
  serialPort.list(function (err, ports) {
    if (err) throw new Error(err);
    let answer = true;
    ports.forEach(function (port, i, posrts) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined) {
        answer = false;
        comName = port.comName;
        manufacturer = port.manufacturer;
        if (debug.search) console.log(`SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}\n`);
        callback(answer, port.comName, port.manufacturer);
      }
    });
    if (answer) { callback(new Error('No encuentro Arduino conectado.')); }
  });
}

function newArduino(comName) {
  sp = new serialPort(comName, option);
  sp.on('open', onOpen);
  sp.on('error', onError);
  sp.on('data', onData);
  sp.on('close', onClose);
  sp.on('disconnect', onDisco);
}

/**
 * Set automaticamente con el primer puerto encontrado
 * 
 * @param {function} callback: (ports: port[]) => void
 */
function set(callback) {
  search((err, comName, manufacturer) => {
    if (err) {
      callback(factoryMsg('error', err.message));
    } else {
      newArduino(comName);
      write('0,0,0,14', callback);
    }
  });
}

function send(code, callback) {
  if (debug.send) console.log("send:\tCode:", code);
  if (comName === "") {
    callback(factoryMsg('error', "Arduino no selectado."));
  } else {
    if (sp.isOpen()) {
      if (debug.isOpen) console.log("Conexc open");
      sp.close((err) => {
        cb = callback;
        write(code, callback);
      });
    } else {
      if (debug.isOpen) console.log("Conexc No open.")
      cb = callback;
      write(code, callback);
    }
  }
}
function write(code, callback) {
  sp.open((err) => {
    if (err) {
      callback(factoryMsg('open', err.message));
    } else {
      if (debug.write) console.log("write:\tCode:", code);
      sp.write(new Buffer(code + '\n'), (err) => {
        if (err) {
          callback(factoryMsg('error', err.message));
        } else {
          working = false;
          sp.drain(callback(factoryMsg('info', "Comando enviado: " + code)));
        }
      });
    }
  });
}

function sendGcode(code, cbWrite, cbAnswer) {
  if (debug.sendGcode) console.log("send:\tCode:", code);
  if (comName === "") {
    callback(factoryMsg('error', "Arduino no selectado."));
  } else {
    if (sp.isOpen()) {
      if (debug.sendGcode) console.log("Conexc open");
      writeGcode(code, cbWrite, cbAnswer);
    } else {
      if (debug.sendGcode) console.log("Conexc No open.")
      sp.open((err) => {
        if (err) {
          cbWrite(factoryMsg("error", err.message));
        } else {
          writeGcode(code, cbWrite, cbAnswer);
        }
      });
    }
  }
}
function writeGcode(code, cbWrite, cbAnswer) {
  if (debug.write) console.log("write:\tCode:", code);
  cb = cbAnswer;
  sp.write(new Buffer(code + '\n'), (err) => {
    if (err) {
      cbWrite(factoryMsg("error", err.message))
    } else {
      working = false;
      sp.drain(cbWrite(factoryMsg("info", "Comando enviado: " + code)));
    }
  });
}

function close(callback) {
  if (sp.isOpen()) {
    if (debug.sendGcode) console.log("Conexc open -> close");
    sp.close((err) => {
      callback(factoryMsg("error", err.message));
    });
  }
}

module.exports = { set, send, sendGcode, close, working, manufacturer, comName }