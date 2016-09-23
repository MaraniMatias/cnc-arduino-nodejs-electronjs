const
  serialPort = require('serialport')
  ;
var
  manufacturer = sp.manufacturer || "Sin Arduino.",
  comName = sp.comName || "",
  working = false,
  debug = {
    write: false,
    sendGcode: false,
    search: false,
    isOpen: false,
    comName: false,
    send: false,
    on: false
  },
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

function search(callback) {
  serialPort.list(function (err, ports) {
    ports.forEach(function (port) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined) {
        comName = port.comName;
        manufacturer = port.manufacturer;
        if (debug.search) console.log(`SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}\n`);
        callback(port.comName);
      }
    });
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
  search((comName) => {
    newArduino(comName);
    callback(comName, manufacturer);
  });
}

function send(code, callback) {
  if (debug.send) console.log("send:\tCode:", code);
  if (comName === "") {
    if (debug.comName) console.log("Arduino no selectado.");
    callback({ type: "error", msg: "Arduino no selectado." });
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
      let msg = process.platform !== "linux" ? "It needs to be administrator. puerto " + comName : "sudo chmod 0777 " + comName;
      callback({ type: "error", msg })
      console.log(msg, '\n', err.message);
    } else {
      if (debug.write) console.log("write:\tCode:", code);
      sp.write(new Buffer(code + '\n'), (err) => {
        if (err) {
          callback({ type: "error", msg: err.message })
        } else {
          working = false;
          sp.drain(
            callback({ type: "info", msg: "Comando enviado: " + code })
          );
        }
      });
    }
  });
}

function sendGcode(code, cbWrite, cbAnswer) {
  if (debug.sendGcode) console.log("send:\tCode:", code);
  if (comName === "") {
    if (debug.sendGcode) console.log("Arduino no selectado.");
    callback({ type: "error", msg: "Arduino no selectado." });
  } else {
    if (sp.isOpen()) {
      if (debug.sendGcode) console.log("Conexc open");
      writeGcode(code, cbWrite, cbAnswer);
    } else {
      if (debug.sendGcode) console.log("Conexc No open.")
      sp.open((err) => {
        if (err) {
          let msg = process.platform !== "linux" ? "It needs to be administrator. puerto " + comName : "sudo chmod 0777 /dev/" + comName;
          cbWrite({ type: "error", msg: msg + " (" + err.message + ")." })
          console.log(msg, '\n', err.message);
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
      cbWrite({ type: "error", msg: err.message })
    } else {
      working = false;
      sp.drain(
        cbWrite({ type: "info", msg: "Comando enviado: " + code })
      );
    }
  });
}

function close(callback) {
  if (sp.isOpen()) {
    if (debug.sendGcode) console.log("Conexc open -> close");
    sp.close((err) => {
      callback(err);
    });
  }
}

module.exports = { set, send, sendGcode, close, working, manufacturer, comName }