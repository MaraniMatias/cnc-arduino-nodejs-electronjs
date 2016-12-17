const cp = require('child_process'),
  fs = require('fs'),
  os = require('os'),
  path = require('path'),
  gc = require('./gcode.js'),
  childDir = {
    //gcode: `${__dirname}/gcode.js`,
    img2gcode: `${__dirname}/img2gcode.js`
  },
  dirDefaultConfig = `${__dirname}/config.json`
  ;

var dirConfig = dirDefaultConfig;
var lineRunning = 0;
var Arduino = require("./arduino.js");
var infoArduino = {
  version: '',
  comName: '',
  manufacturer: "Sin Arduino"
};
var File = {
  workpiece: { x: 300, y: 400 },
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
 * @param [log || error ] type
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
  let time = (config.motor.x.time + config.motor.y.time) / 2;
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
    if (typeof (cbMessage[m.msj]) === 'function') cbMessage[m.msj](fork, m.data);
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
  switch (extension) {
    case '.png':
    case '.jpeg':
    case '.gif':
    case '.jpg':
      return true
    default:
      return false
  }
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
    if (typeof (dir) !== 'string') { dir = dir[0]; }
    let dirfile = path.resolve(dir);
    let extension = path.extname(dirfile);
    let fileName = path.win32.basename(dirfile);
    if (extension === '.png' && os.platform() === 'linux') {
      log('setFile', "With linux only GIF, JPEG, JPG. Lwip and electron js in linux are not carried: D.");
      cb.error(factoryMsg(0, 'No podemos leer PNG. pruebe con GIF , JPEG , JPG.'));
    }
    else if (isImg(extension)) {
      cb.tick({ info: `Preparando... ${fileName}.` });
      readConfig().then((fileConfig) => {
        childFactory(childDir.img2gcode, {
          error: (child, error) => {
            log("setFile", `${fileName} - ${error}`);
            cb.error(factoryMsg(0, `${fileName} - ${error}`));
            child.kill();
          },
          /*tick: (child, arg) => {
            // progresBar
            // perc: arg.perc,
            // imgName: fileName,
          },*/
          finished: (child, data) => {
            child.kill();
            cb.tick(factoryMsg(3, `GCode creado con ${fileName}.\nGuardado en ${data.dirgcode}.`));
            setGCode(data.dirgcode, initialLine, cb);
          }
        }).send({ // It is mm
          toolDiameter: fileConfig.toolConfig.toolDiameter,
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
    } else { setGCode(dirfile, initialLine, cb); }
  } else { cb.finished({ dir: null }); log("setFile", 'It isn\'t file.'); }
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
function sendCommand(code, callback) {
  log("sendCommand", 'code: ' + code);
  Arduino.send(code, (err, msg, data) => {
    // /\d{1,}\.\d{1,}\.\d{1,}/.test(data) => 5
    // /\d{1,},\d{1,},\d{1,}(,\d)?/.test(data) => 4
    callback(factoryMsg(
      err ? 0 : 
        data ? ( /\d{1,}\.\d{1,}\.\d{1,}/.test(data) ? 'version' : 4 )
          : 3, err ? err.message : msg, data));
  });
}

/**
 * Look for an arduino connected to the pc and informs if the connection could be made.
 * 
 * @param {function} callback
 */
function reSetArduino(callback) {
  if (!Arduino.working) {
    let infoArduinoSet =  (version, comName, manufacturer) => {
      infoArduino.version = version;
      infoArduino.comName = comName;
      infoArduino.manufacturer = manufacturer;
    };
    Arduino.set((err, comName, manufacturer, version) => {
      if (!err) {
        log('reSetArduino', 'SerialPort:\n\tComName: ' + comName + '\n\tManufacturer: ' + manufacturer);
        infoArduinoSet(version, comName, manufacturer);
        callback(factoryMsg(2, "Arduino detectado '" + manufacturer + "'. Puerto: " + comName + " Ardu-Codigo: " + version));
      } else {
        callback(factoryMsg(comName ? 0 : 1, err && err.message || "Arduino conectado."));
        log('reSetArduino', 'Arduino does not connected.');
      }
    });
  } else {
    callback(factoryMsg(1, "Arduino trabajando " + Arduino.manufacturer));
    log('reSetArduino', "Arduino working.");
  }
}

/**
 * Calculate the steps for the new line
 * 
 * @param {number} l line number
 * @param {number[]} oldSteps Steps from the previous line
 * @param {file config} config
 * @returns number[]
 */
function getSteps(l, oldSteps, config) {
  let a = l !== 0 ? File.gcode[l - 1].ejes : File.gcode[l].ejes;
  let x = [0, 0, 0, 0];// [X, Y, Z, F]
  let b = File.gcode[l].ejes;
  x[0] = Math.round((b[0] - a[0]) * config.motor.x.steps / config.motor.x.advance) * config.scale - oldSteps[0];//* (config.motor.x.sense)? -1 : 1;
  x[1] = Math.round((b[1] - a[1]) * config.motor.y.steps / config.motor.y.advance) * config.scale - oldSteps[1];//* (config.motor.y.sense)? -1 : 1;
  x[2] = Math.round((b[2] - a[2]) * config.motor.z.steps / config.motor.z.advance) * config.scale - oldSteps[2];//* (config.motor.z.sense)? -1 : 1;
  x[3] = config.feedSpeed.ignore && a.f || config.feedSpeed.value
  return x
}

/**
 * Begins to interpret the g code
 * 
 * @param { follow : boolean , steps: number[] } arg : follow -> Resumes previous run
 * @param {function} callback
 */
function start(arg, callback) {
  log('Start', arg + "working: " + Arduino.working);
  if (!Arduino.working) {
    if (!arg.follow) { lineRunning = 0; }
    log('Start', "lineRunning: " + lineRunning);
    let fileRead = new Promise(function (resolve, reject) {
      fs.readFile(dirConfig, "utf8", function (error, data) {
        resolve(JSON.parse(data));
      });
    }).then((config) => {
      if (File.gcode.length > 0) {
        let cbAnswer = (err, msg, data) => {
          log('Start', `cbAnswer: err: ${err}, msg: ${msg}`);
          let result = data.toString().split(',');
          lineRunning++;
          if (lineRunning < File.gcode.length) {
            log('Start', "line:", lineRunning);
            callback({ lineRunning, steps: result });
            Arduino.sendGcode(getSteps(lineRunning, arg.steps, config), cbWrite, cbAnswer);
          } else {
            log('Start', lineRunning, "fin :D");
            lineRunning = 0;
            Arduino.close((err) => {
              Arduino.working = false;
              callback({ lineRunning: false, steps: ['0', '0', '0'] });
            });
          }
        };
        let cbWrite = (err, msg, data) => {
          log('Start', "cbWrite: \n\tLine" + lineRunning + "\n\tData: " + data);
        }
        Arduino.sendGcode(getSteps(lineRunning, arg.steps, config), cbWrite, cbAnswer);

      }//  File.gcode.length > 0
    });// then Promise
  } else {
    callback(factoryMsg(0, "Arduino trabajando. o error en comunicacion."));
  }
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
      fs.writeFile(newDir, JSON.stringify(require(dirConfig)), { encoding: 'utf8' }, (errW) => {
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
  fs.writeFile(dirConfig, JSON.stringify(data || require(dirDefaultConfig)), { encoding: 'utf8' }, (err) => {
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
  return new Promise(function (resolve, reject) {
    fs.readFile(dirConfig, "utf8", function (error, data) {
      if (error) throw error;
      resolve(JSON.parse(data));
    });
  })
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
    case 0: type = 'error'; break;
    case 1: type = 'warning'; break;
    case 2: type = 'success'; break;
    case 3: type = 'info'; break;
    case 4: type = 'data'; break;
    case 5: type = 'none'; break;
    default: type = type; break;
  }
  return { type, message, data }
}

module.exports = {
  log,
  File,
  start,
  setFile,
  reSetArduino,
  Arduino: {
    working: Arduino.working,
    info: infoArduino
  },
  sendCommand,
  configFile: {
    set: setConfig,
    dir: dirConfig,
    read: readConfig,
    save: saveConfig
  }
};