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
  debug = {
    arduino: {
      start: true,
      conect: false,
      sendCommand: true
    },
    file: {},
    config: {},
    ipc: { arduino: false, console: false, sendStart: false },
    app: { prevent: false }
  }
  ;

var dirConfig = dirDefaultConfig;
var lineRunning = 0;
var Arduino = require("./arduino.js");
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

function getMiliSeg(config) {
  let steps = (config.motor.x.steps + config.motor.y.steps) / 2;
  let time = (config.motor.x.time + config.motor.y.time) / 2;
  let advance = (config.motor.x.advance + config.motor.y.advance) / 2;
  return steps * time / advance;
}

function end() {
  sendCommand('0,0,0', () => {
    console.log("Por cierre de programa, envio 0,0,0 para arduino");
  });
}

function childFactory(forkDir, cbMessage) {
  let fork = cp.fork(forkDir);
  fork.on('message', (m) => {
    if (typeof (cbMessage[m.msj]) === 'function') cbMessage[m.msj](fork, m.data);
  });
  return fork;
}

function isImg(extension) {
  switch (extension) {
    case '.png':
      return true
    case '.jpeg':
      return true
    case '.gif':
      return true
    case '.jpg':
      return true
    default:
      return false
  }
}

function setFile(dir, initialLine, cb) {
  if (dir) {
    if (typeof (dir) !== 'string') { dir = dir[0]; }
    let dirfile = path.resolve(dir);
    let extension = path.extname(dirfile);
    let fileName = path.win32.basename(dirfile);
    if (extension === '.png' && os.platform() === 'linux') {
      console.log("Con linux solo GIF , JPEG , JPG. lwip y electronjs en linux no se llevan :D.");
      cb.error(factoryMsg(0, 'Por ahora solo leems GIF , JPEG , JPG'));
    }
    else if (isImg(extension)) {
      cb.tick({ info: `Preparando... ${fileName}.` });
      readConfig().then((fileConfig) => {
        childFactory(childDir.img2gcode, {
          error: (child, error) => {
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
  } else { cb.finished({ dir: null }); console.log('It isn\'t file.'); }
}

function setGCode(dirfile, initialLine, cb) {
  if (dirfile) {
    File.name = path.win32.basename(dirfile);
    cb.tick(factoryMsg(3, `Preparando gcode desde ${File.name}...`));
    console.log(`Preparando gcode desde ${File.name}...`);
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
 * @param  {String} code '0,0,0,14' or p or any
 * @param  {function} callback
 */
function sendCommand(code, callback) {
  if (debug.arduino.sendCommand) { console.log(`${__filename} => sendCommand, code: ${code}`); }
  Arduino.send(code, (err, msg, data) => {
    //callback({type: 'data',message:"message",data:{steps:['0','0','0']}});
    callback(factoryMsg(err ? 0 : data ? 4 : 3, err ? err.message : msg, data));
  });
}

function reSet(callback) {
  //callback(factoryMsg(2, "Arduino detectado ''. Puerto: "));
  if (!Arduino.working) {
    Arduino.set((err, comName, manufacturer) => {
      if (!err) {
        if (debug.arduino.conect) console.log(`SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}\n`);
        callback(factoryMsg(2, "Arduino detectado '" + manufacturer + "'. Puerto: " + comName));
      } else {
        callback(factoryMsg(comName ? 0 : 1, err && err.message || "Arduino conectado."));
        if (debug.arduino.conect) console.warn('No Arduino.');
      }
    });
  } else {
    callback(factoryMsg(1, "Arduino trabajando " + Arduino.manufacturer));
    if (debug.arduino.conect) console.log("Arduino working.");
  }
}

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

function start(arg, callback) {
  if (debug.arduino.start) console.log(arg, "working: " + Arduino.working);
  if (!Arduino.working) {
    if (!arg.follow) { lineRunning = 0; }
    if (debug.arduino.start) console.log("lineRunning: " + lineRunning);
    let fileRead = new Promise(function (resolve, reject) {
      fs.readFile(dirConfig, "utf8", function (error, data) {
        resolve(JSON.parse(data));
      });
    }).then((config) => {
      if (File.gcode.length > 0) {

        let cbAnswer = (data) => {
          let result = data.toString().split(',');
          lineRunning++;
          if (lineRunning < File.gcode.length) {
            if (debug.arduino.start) console.log("cbAnswer:", lineRunning, result);
            callback({ lineRunning, steps: result });
            Arduino.sendGcode(getSteps(lineRunning, arg.steps, config), cbWrite, cbAnswer);
          } else {
            console.log(lineRunning, "fin :D");
            lineRunning = 0;
            Arduino.close((err) => {
              Arduino.working = false;
              callback({ lineRunning: false, steps: ['0', '0', '0'] });
            });
          }
        };
        let cbWrite = (data) => { if (debug.arduino.start) console.log("cbWrite", lineRunning, data); }

        Arduino.sendGcode(getSteps(lineRunning, arg.steps, config), cbWrite, cbAnswer);

      }//  File.gcode.length > 0 
    });// then Promise
  } else {
    callback(factoryMsg(0, "Arduino trabajando. o error en comunicacion."));
  }
}

function setConfig(dirUserData) {
  let newDir = path.resolve(dirUserData, "config.json");
  fs.stat(newDir, (err, stats) => {
    if (err) {
      console.log("File config isn't in userData.",dirUserData);
      fs.writeFile(newDir, JSON.stringify(require(dirConfig)), { encoding: 'utf8' }, (errW) => {
        if (errW) throw errW;
        dirConfig = newDir;
      })
    } else {
      dirConfig = newDir;
    }
  })
}

function saveConfig(data, cb) {
  fs.writeFile(dirConfig, JSON.stringify(data || require(dirDefaultConfig)), { encoding: 'utf8' }, (err) => {
    if (err) throw err;
    readConfig().then((file) => {
      cb(factoryMsg(2, 'Cambios guardados.', file));
    });
  });
}

function readConfig() {
  return new Promise(function (resolve, reject) {
    fs.readFile(dirConfig, "utf8", function (error, data) {
      if (error) throw error;
      resolve(JSON.parse(data));
    });
  })
}
/**
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
  debug,
  end,
  File,
  start,
  setFile,
  Arduino: {
    reSet,
    working: Arduino.working,
    comName: Arduino.comName,
    manufacturer: Arduino.manufacturer
  },
  sendCommand,
  configFile: {
    set: setConfig,
    dir: dirConfig,
    read: readConfig,
    save: saveConfig
  }
};
