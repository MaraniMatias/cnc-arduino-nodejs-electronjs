const
  serialPort = require('serialport');
var
  manufacturer = sp ? sp.manufacturer : "Sin Arduino.",
  comName = sp ? sp.comName : "",
  working = false,
  sp,
  workingGCode = false,
  onData = function (data) {
    if (debug.on) console.log("Ardu. 'data':", data);
    working = false;
    if (typeof (cb) === 'function') {
      cb(null, "Respuesta Arduino: " + data, { steps: data.toString().split(',') });
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
  cb = function (err, msg, data) { console.log("default:", data) }
  ;

/**
 * Show consolo log
 * 
 * @param {any} function
 * @param {any} value
 * @param [log || error ] type
 */
function log(func, value, type) {
  console[type || log](__filename + "\n -> " + func + ":\n*\t", value);
}

/**
 * List of found ports.
 *
 * @param {function} callback: (ports: port[]) => void
 */
/*
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
*/

/**
 * Look for an arduino connected and test the connection and inform
 * 
 * @param {function} callback(err, port.comName, port.manufacturer) 
 */
function search(callback) {
  serialPort.list(function (err, ports) {
    if (err) throw new Error(err);
    let answer = true;
    ports.forEach(function (port, i, posrts) {
      if (port.pnpId !== undefined && port.manufacturer !== undefined) {
        answer = false;
        comName = port.comName;
        manufacturer = port.manufacturer;
        log("search", `SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}`);
        callback(null, port.comName, port.manufacturer);
      }
    });
    if (answer) { callback(new Error('No encuentro Arduino conectado.')); }
  });
}

/**
 * Creates a serial port to work with arduino
 * 
 * @param {Path of Arduino} comName
 * @param {function} callback
 */
function newArduino(comName, cb) {
  sp = new serialPort(comName, option);
  sp.on('open', onOpen);
  sp.on('error', onError);
  sp.on('data', onData);
  sp.on('close', onClose);
  sp.on('disconnect', onDisco);
  cb();
}

/**
 * Set automaticamente con el primer puerto encontrado
 * Y prueba la conexión, then run callback(err,comName,manufacturer)
 * @param {function} callback:(err:Error,comName:String,manufacturer:String)=>void
 */
function set(callback) {
  search((err, comName, manufacturer) => {
    if (err) { callback(err); }
    else {
      newArduino(comName, () => {
        sp.open((err) => {
          if (err) {
            callback(new Error(process.platform !== "linux" ? "It needs to be administrator. puerto " + comName : "sudo chmod 0777 " + comName), comName, manufacturer);
          } else {
            close((err) => {
              callback(err, comName, manufacturer)
            }); // sp.write(new Buffer('0,0,0,14\n'), (err) => {});
          }
        });
      });
    }
  });
}

/**
 * Close open connections before sending code.
 * 
 * @param {string} code
 * @param {function} callback(err, msg)
 */
function send(code, callback) {
  log("send", "send:\tCode: " + code);
  if (comName === "") {
    callback(new Error("Arduino no selectado."));
  } else {
    cb = callback;
    if (sp.isOpen()) {
      log("send", "Conexc open");
      sp.close((err) => {
        if (err) {
          callback(new Error('Error al cerrar el puerto.\n ' + err.message))
        } else {
          write(code, callback);
        }
      });
    } else {
      log("send", "Conexc No open.")
      write(code, callback);
    }
  }
}

/**
 * Write in the port.
 * 
 * @param {string} code
 * @param {function} callback(err, msg)
 */
function write(code, callback) {
  sp.open((err) => {
    if (err) {
      callback(err);
    } else {
      log("write", "write:\tCode:", code);
      sp.write(new Buffer(code + '\n'), (err) => {
        if (err) {
          callback(err);
        } else {
          working = false;
          sp.drain(callback(null, "Comando enviado: " + code));
        }
      });
    }
  });
}

/**
 * Close open connections before sending code.
 * 
 * @param {string} code.
 * @param {function} cbWrite callback Is executed when it finishes writing to the port.
 * @param {function} cbAnswer callback Runs when Arduino answers.
 */
function sendGcode(code, cbWrite, cbAnswer) {
  log("sendGcode", "send:\tCode:", code);
  if (comName === "") {
    callback(new Error("Arduino no selectado."));
  } else {
    if (sp.isOpen()) {
      log("sendGcode", "Conexc open");
      writeGcode(code, cbWrite, cbAnswer);
    } else {
      log("sendGcode", "Conexc No open.")
      sp.open((err) => {
        if (err) {
          cbWrite(err);
        } else {
          writeGcode(code, cbWrite, cbAnswer);
        }
      });
    }
  }
}

/**
 * Write in the port.
 * 
 * @param {string} code.
 * @param {function} cbWrite callback Is executed when it finishes writing to the port.
 * @param {function} cbAnswer callback Runs when Arduino answers.
 */
function writeGcode(code, cbWrite, cbAnswer) {
  if (debug.write) console.log("write:\tCode:", code);
  cb = cbAnswer;
  sp.write(new Buffer(code + '\n'), (err) => {
    if (err) {
      cbWrite(err)
    } else {
      working = false;
      sp.drain(cbWrite(null, "Comando enviado: " + code));
    }
  });
}

/**
 * Closes the connection with arduino.
 * 
 * @param {function} callback
 */
function close(callback) {
  if (sp.isOpen()) {
    log("close", "Conexc open -> close");
    sp.close((err) => {
      callback(err);
    });
  }
}

module.exports = { set, send, sendGcode, close, working, manufacturer, comName }