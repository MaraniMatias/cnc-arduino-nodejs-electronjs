const
  dirConfig = __dirname + "/config.json",
  fs = require('fs'),
  path = require('path'),
  gc = require("./gcode"),
  debug = {
    arduino: {
      start: false,
      conect: false,
      sendCommand: false,
      working: false
    },
    file: {},
    config: {},
    ipc: { arduino: false, console: false, sendStart: false },
    app: { prevent: false }
  }
  ;
var img2gcode = require('img2gcode');
var lwip = require('lwip');

var lineRunning = 0;
var Arduino = require("./arduino.js");
var File = {
  workpiece: { x: 300, y: 400 },
  gcode: [],
  dir: '',
  name: 'Sin Archivo',
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

function setFile(dir, initialLine, cb) {
  if (dir) {
    let dirfile = path.resolve(dir[0]);
    let extension = path.extname(dirfile);
    if (extension === '.png') { console.log('Por ahora no podemos leer png :('); }
    else if (extension === '.gif' || extension === '.jpeg' || extension === '.jpg') {
      img2gcode.start({  // It is mm
        toolDiameter: 1,
        scaleAxes: 700,
        deepStep: -1,
        whiteZ: 0,
        blackZ: -2,
        sevaZ: 2,
        info: "emitter",
        dirImg: dirfile
      })
        .on('tick', (perc) => {
          console.log(perc);
        })
        .then((data) => {
          setGCode(data.dirgcode, initialLine, cb);
        });
    } else {
      setGCode(dirfile, initialLine, cb);
    }
  } else {
    console.log('It isn\'t file.');
  }
}
function setGCode(dirfile, initialLine, cb) {
  if (dirfile) {
    readConfig().then((config) => {
      File.workpiece.x = config.workpiece.x;
      File.workpiece.y = config.workpiece.y;
      File.dir = dirfile;
      File.gcode = gc(fs.readFileSync(dirfile).toString(), initialLine);
      File.name = path.posix.basename(dirfile);
      File.lines = File.gcode.length;
      File.travel = File.gcode[File.gcode.length - 1].travel;
      File.segTotal = File.gcode[File.gcode.length - 1].travel * getMiliSeg(config);
      cb(File);
    });
  }
}
/**
 * @param  {String} code '0,0,0' or p or any
 * @param  {function} callback
 */
function sendCommand(code, callback) {
  if (debug.arduino.sendCommand) { console.log(`${__filename} ==>> sendCommand, code: ${code}`); }
  Arduino.send(code, callback);
}

function reSet(callback) {
  if (!Arduino.working) {
    Arduino.set((comName, manufacturer) => {
      if (comName !== undefined) {
        if (debug.arduino.conect) console.log(`SerialPort:\n\tComName: ${port.comName}\n\tPnpId: ${port.pnpId}\n\tManufacturer: ${port.manufacturer}\n`);
        callback({
          type: "success",
          msg: "Arduino detectado '" + manufacturer + "'. Puerto: " + comName
        });
      } else {
        callback({
          type: 'error',
          msg: 'No encontramos arduino.'
        });
        if (debug.arduino.conect) console.warn('No Arduino.');
      }
    });
  } else {
    callback({
      type: 'warning',
      msg: 'Arduino trabajando ' + Arduino.manufacturer
    });
    if (debug.arduino.conect) console.log("Arduino working.");
  }
}

function getSteps(l, oldSteps, config) {
  let a = l !== 0 ? File.gcode[l - 1].ejes : File.gcode[l].ejes;
  let x = [0, 0, 0];
  let b = File.gcode[l].ejes;
  x[0] = Math.round((b[0] - a[0]) * config.motor.x.steps / config.motor.x.advance) - oldSteps[0];//* (config.motor.x.sense)? -1 : 1;
  x[1] = Math.round((b[1] - a[1]) * config.motor.y.steps / config.motor.y.advance) - oldSteps[1];//* (config.motor.y.sense)? -1 : 1;
  x[2] = Math.round((b[2] - a[2]) * config.motor.z.steps / config.motor.z.advance) - oldSteps[2];//* (config.motor.z.sense)? -1 : 1;
  return x;
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
    callback({ type: "error", msg: "Arduino trabajando. o error en comunicacion." });
  }
}

function saveConfig(data, cb) {
  fs.writeFile(dirConfig, JSON.stringify(data), { encoding: 'utf8' }, (err) => {
    if (err) throw err;
    readConfig().then((file) => {
      cb({ file, message: 'Cambios guardados.', type: 'success' });
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

module.exports = {
  debug,
  Arduino: {
    comName: Arduino.comName,
    manufacturer: Arduino.manufacturer,
    reSet,
    working: Arduino.working
  },
  File,
  setFile,
  start,
  sendCommand,
  configFile: {
    dir: dirConfig,
    read: readConfig,
    save: saveConfig
  }
};