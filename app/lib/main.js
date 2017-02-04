const cp = require('child_process'),
  fs = require('fs'),
  os = require('os'),
  path = require('path'),
  gc = require('./gcode.js'),
  childDir = {
    //gcode: `${__dirname}/gcode.js`,
    img2gcode: `${__dirname}/img2gcode.js`
  },
  dirDefaultConfig = `${__dirname}/config.json`,
  ArduinoCode = {
    dir: path.resolve(path.join(__dirname, '../arduino', '/CNCino')),
    file: ['CNCino.ino', 'mover.ino', 'estado.ino']
  };

var dirConfig = dirDefaultConfig;
var lineRunning = 0;
var Arduino = require("./arduino.js");
var infoArduino = {
  isWorking: false, //mas adelante lo veo mejor
  version: '',
  comName: '',
  manufacturer: "Sin Arduino"
};
var File = {
  workpiece: {
    x: 200,
    y: 200
  },
  gcode: [],
  dir: '',
  name: 'Sin Archivo',
  scale: 1,
  lines: 0,
  travel: 0,
  segTotal: 0
};

/**
 * Show consolo log
 *
 * @param {any} function
 * @param {any} value
 */
function log(func, value) {
  console.log(__filename + "\n -> " + func + ":\n*\t", value);
}

/**
 * Get the average milliseconds between the X and Y motors in steps
 *
 * @param {file config} config
 * @returns
 */
function getMiliSeg(config) {
  let steps = (config.motor.x.steps + config.motor.y.steps) / 2;
  let time = (config.motor.x.speed.working + config.motor.y.speed.working) / 2;
  let advance = (config.motor.x.advance + config.motor.y.advance) / 2;
  return steps * time / advance;
}

/**
 * Create child processes used to convert an image into g-code
 *
 * @param {string} forkDir Module path
 * @param { error:function, finished:function } cbMessage
 * @returns
 */
function childFactory(forkDir, cbMessage) {
  let fork = cp.fork(forkDir);
  fork.on('message', (m) => {
    if (typeof(cbMessage[m.msj]) === 'function') cbMessage[m.msj](fork, m.data);
  });
  return fork;
}

/**
 * Is img ?
 *
 * @param {string} extension .png or .jpeg or .gif or .jpg
 * @returns
 */
function isImg(extension) {
  return /\.(png|jpe{0,1}g|gif)/i.test(extension);
}

/**
 * If you receive an image it converts it into code g with the thickenings of the file config.json
 * otherwise it passes it to 'setGCode'
 *
 * @param {string} dir Path of the file
 * @param {number[]} initialLine [0,0,0]
 * @param {function} cb
 */
function setFile(dir, initialLine, cb) {
  if (dir) {
    if (typeof(dir) !== 'string') {
      dir = dir[0];
    }
    let dirfile = path.resolve(dir);
    let extension = path.extname(dirfile);
    let fileName = path.win32.basename(dirfile);
    if (/\.bmp/i.test(extension)) {
      cb.error(factoryMsg(0, 'No podemos leer BMP. pruebe con GIF , JPEG , JPG or PNG.'));
    } else if (isImg(extension)) {
      cb.tick({
        info: `Preparando... ${fileName}.`
      });
      readConfig().then((fileConfig) => {
        childFactory(childDir.img2gcode, {
          error: (child, error) => {
            log("setFile", `${fileName} - ${error}`);
            cb.error(factoryMsg(0, `${fileName} - ${error}`));
            child.kill();
          },
          tick: (child, arg) => {
            console.log("Img:", fileName, "Progres:", arg.perc);
            cb.perc({
              perc: arg.perc,
              info: fileName
            });
          },
          finished: (child, data) => {
            child.kill();
            cb.tick(factoryMsg(3, `GCode creado con ${fileName}.\nGuardado en ${data.dirgcode}.`));
            setGCode(data.dirgcode, initialLine, cb);
          }
        }).send({ // It is mm
          toolDiameter: fileConfig.toolConfig.toolDiameter || 1,
          scaleAxes: !fileConfig.toolConfig.heightImage && fileConfig.toolConfig.scaleAxes || undefined,
          deepStep: fileConfig.toolConfig.deepStep,
          feedrate: fileConfig.toolConfig.feedrate,
          whiteZ: fileConfig.toolConfig.whiteZ,
          blackZ: fileConfig.toolConfig.blackZ,
          safeZ: fileConfig.toolConfig.safeZ,
          dirImg: dirfile,
          info: "emitter"
        });
      })
    } else {
      setGCode(dirfile, initialLine, cb);
    }
  } else {
    cb.finished({
      dir: null
    });
    log("setFile", 'It isn\'t file.');
  }
}

/**
 * recibe un archivo de codigo y lo prepara con la configuracion del archivo config.json
 *
 * @param {string} dir Path of the file
 * @param {number[]} initialLine [0,0,0]
 * @param {function} cb
 */
function setGCode(dirfile, initialLine, cb) {
  if (dirfile) {
    File.name = path.win32.basename(dirfile);
    cb.tick(factoryMsg(3, `Preparando gcode desde ${File.name}...`));
    log("setGCode", `Preparando gcode desde ${File.name}...`);
    readConfig().then((config) => {
      File.workpiece.x = config.workpiece.x;
      File.workpiece.y = config.workpiece.y;
      File.dir = dirfile;
      File.scale = config.scale;
      File.gcode = gc(fs.readFileSync(dirfile).toString(), initialLine);
      File.lines = File.gcode.length;
      File.travel = File.gcode[File.gcode.length - 1].travel;
      File.segTotal = File.gcode[File.gcode.length - 1].travel * getMiliSeg(config);
      cb.finished(File);
    });
  }
}

/**
 * Send command to Arduino
 * @param  {String} code '0,0,0,14' or p or v or any
 * @param  {function} callback
 */
function sendCommand(arg, callback) {
  log("sendCommand", 'code: ' + arg.code + ' type: ' + arg.type + ' sentido: ' + arg.sense);
  let code = String(arg.code).split(',');
  readConfig().then((config) => {
    Arduino.send((arg.type !== 'mm') ? arg.code : toSteps(config, code, [0, 0, 0, 0], arg.sense), (err, msg, data) => {
      infoArduino.isWorking = false;
      // /\d{1,}\.\d{1,}\.\d{1,}/.test(data) => 5
      // /\d{1,},\d{1,},\d{1,}(,\d)?/.test(data) => 4
      callback(factoryMsg(
        err ? 0 :
        data ? (/\d{1,}\.\d{1,}\.\d{1,}/.test(data) ? 'version' : 4) :
        3, err ? err.message : msg, data));
      // code, ejes, steps
    });
  });
}

/**
 * Look for an arduino connected to the pc and informs if the connection could be made.
 *
 * @param {function} callback
 */
function reSetArduino(onDesconect, callback) {
  if (!infoArduino.isWorking) {
    let infoArduinoSet = (arduino) => {
      infoArduino.version = arduino.version;
      infoArduino.comName = arduino.comName;
      infoArduino.manufacturer = arduino.manufacturer;
    };
    Arduino.set(onDesconect, (err, arduino) => {
      if (!err) {
        log('reSetArduino', 'SerialPort:\n\tComName: ' + arduino.comName + '\n\tManufacturer: ' + arduino.manufacturer);
        infoArduinoSet(arduino);
        readConfig().then((config) => {
          callback(factoryMsg(arduino.version !== config.arduino.version ? 2 : 1, "Arduino detectado '" + arduino.manufacturer + "'. Puerto: " + arduino.comName + " Ardu-Codigo: " + arduino.version));
        })
      } else {
        callback(factoryMsg(arduino ? 0 : 1, err && err.message || "Arduino conectado."));
        log('reSetArduino', err.message);
      }
    });
  } else {
    callback(factoryMsg(1, "Arduino trabajando " + arduino.manufacturer));
    log('reSetArduino', "Arduino working.");
  }
}

/**
 *  mm to steps
 *
 * @param {file config} config
 * @param {number[]} newMM
 * @param {number[]} oldSteps
 * @param {char} sense '-' or '' or undefined
 * @returns
 */
function toSteps(config, newMM, oldSteps, sense) {
  oldSteps = oldSteps || [0, 0, 0, 0];
  sense = sense === '-' && -1 || 1;
  let x = [0, 0, 0, 0]; // [X, Y, Z, F];
  x[0] = sense * Math.round(newMM[0] * config.motor.x.steps / config.motor.x.advance) * config.scale - oldSteps[0]; //* (config.motor.x.sense)? -1 : 1;
  x[1] = sense * Math.round(newMM[1] * config.motor.y.steps / config.motor.y.advance) * config.scale - oldSteps[1]; //* (config.motor.y.sense)? -1 : 1;
  x[2] = sense * Math.round(newMM[2] * config.motor.z.steps / config.motor.z.advance) * config.scale - oldSteps[2]; //* (config.motor.z.sense)? -1 : 1;
  x[3] = config.feedSpeed.ignore && a.f || config.feedSpeed.value
  return x
}
/**
 * Calculate the steps for the new line.
 *
 * @param {number} l line number
 * @param {number[]} oldSteps Steps from the previous line
 * @returns number[]
 */
function getSteps(l, oldSteps, config) {
  let a = l !== 0 ? File.gcode[l - 1].ejes : File.gcode[l].ejes;
  let b = File.gcode[l].ejes;
  let deltaMM = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  return toSteps(config, deltaMM, oldSteps)
}

/**
 * Begins to interpret the g code
 *
 * @param { follow : boolean , steps: number[] } arg : follow -> Resumes previous run
 * @param {function} callback
 */
function start(arg, callback) {
  log('Start', arg + "working: " + infoArduino.isWorking);
  if (!infoArduino.isWorking) {
    if (!arg.follow) {
      lineRunning = 0;
    }
    log('Start', "lineRunning: " + lineRunning);
    readConfig().then((config) => {
      if (File.gcode.length > 0) {
        let cbAnswer = (err, msg, data) => {
          infoArduino.isWorking = true;
          log('Start', `cbAnswer: err: ${err}, msg: ${msg}`);
          lineRunning++;
          if (lineRunning < File.gcode.length) {
            log('Start', "line:", lineRunning);
            let steps = getSteps(lineRunning, arg.steps, config);
            callback({
              lineRunning,
              steps
            });
            Arduino.sendGcode(steps, cbWrite, cbAnswer);
          } else {
            log('Start', lineRunning, "fin :D");
            lineRunning = 0;
            Arduino.close((err) => {
              infoArduino.isWorking = false;
              callback({
                lineRunning: false,
                steps: ['0', '0', '0']
              });
            });
          }
        };
        let cbWrite = (err, msg, data) => {
          infoArduino.isWorking = true;
          log('Start', "cbWrite: \n\tLine" + lineRunning + "\n\tData: " + data);
        }
        Arduino.sendGcode(getSteps(lineRunning, arg.steps, config), cbWrite, cbAnswer);

      } //  File.gcode.length > 0
    }); // then Promise
  } else {
    callback(factoryMsg(0, "Arduino trabajando. o error en comunicacion."));
  }
}

function serialPortTest(callback) {
  let i = 0;
  let cbwrite = (err,data) => {
    callback(factoryMsg((err && 0) || 3, err || "Prueba: " + i + "%", data));
  };
  let cbanswer = (err, msg, data) => {
    callback(factoryMsg((err && 0) || 4, err || i >= 100 && "Termine" || "Respuesta: " + data, data));
    if (i < 100) {
      Arduino.sendGcode("0,0,-316,15", cbwrite, cbanswer);
      i++;
    } else {
      Arduino.close();
    }
  };
  Arduino.sendGcode("20,20,20,14", cbwrite, cbanswer);
}

/**
 * Saves the json configuration file for the first time.
 *
 * @param {string} dirUserData
 */
function setConfig(dirUserData) {
  let newDir = path.resolve(dirUserData, "config.json");
  fs.stat(newDir, (err, stats) => {
    if (err) {
      log("setConfig", "File config isn't in userData: " + dirUserData);
      fs.writeFile(newDir, JSON.stringify(require(dirConfig)), {
        encoding: 'utf8'
      }, (errW) => {
        if (errW) throw errW;
        dirConfig = newDir;
      })
    } else {
      dirConfig = newDir;
    }
  })
}

/**
 * Save a specified setting or default
 *
 * @param {file config or undefined} data
 * @param {function} cb
 */
function saveConfig(data, cb) {
  fs.writeFile(dirConfig, JSON.stringify(data || require(dirDefaultConfig)), {
    encoding: 'utf8'
  }, (err) => {
    if (err) throw err;
    readConfig().then((file) => {
      cb(factoryMsg(2, 'Cambios guardados.', file));
    });
  });
}

/**
 * Read configuration file from the user folder.
 *
 * @returns file config
 */
function readConfig() {
  return new Promise(function(resolve, reject) {
    fs.readFile(dirConfig, "utf8", function(error, data) {
      if (error) throw error;
      resolve(JSON.parse(data));
    });
  })
}

/**
 * Save the CNC code for Arduino.
 *
 * @param {String} folder dir for save CNC code.
 * @param {function} cb
 */
function saveArduinoCode(dir, callback) {
  if (dir) {
    let fileDir = dir[0];
    fs.mkdir(path.resolve(path.join(fileDir, '/CNCino')), () => {
      ArduinoCode.file.forEach(function(file) {
        let from = path.resolve(path.join(__dirname, '../arduino', '/CNCino', file)),
          to = path.resolve(path.join(fileDir, '/CNCino', file));
        console.log('Saving from', from, 'to', to);
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
      }, this);
      callback(factoryMsg(2, 'Grabe en Arduino el progrma guardado en ' + fileDir, fileDir));
    })
  }
}

/**
 * Message factory
 * 'e' -> 0, 'w' -> 1, 's' -> 2, 'i' -> 3, 'd' -> 4, 'n' -> 5
 *
 * @param {number} type
 * @param {String} message
 * @param {any} data
 * @returns { type, message, data }
 */
function factoryMsg(type, message, data) {
  switch (type) {
    case 0:
      type = 'error';
      break;
    case 1:
      type = 'warning';
      break;
    case 2:
      type = 'success';
      break;
    case 3:
      type = 'info';
      break;
    case 4:
      type = 'data';
      break;
    case 5:
      type = 'none';
      break;
    default:
      type = type;
      break;
  }
  return {
    type,
    message,
    data
  }
}

module.exports = {
  log,
  File,
  start,
  setFile,
  reSetArduino,
  Arduino: infoArduino,
  sendCommand,
  serialPortTest,
  saveArduinoCode,
  configFile: {
    set: setConfig,
    dir: dirConfig,
    read: readConfig,
    save: saveConfig
  }
};
