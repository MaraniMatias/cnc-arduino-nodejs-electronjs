function G0(prevState, nextState, command, args) {
  var travel = prevState.travel;
  for (var j = 0; j < args.length; j++) {
    switch (args[j].charAt(0).toLowerCase()) {
      case 'x':
        nextState.ejes[0] = parseFloat(args[j].slice(1));
        if (nextState.ejes[0] > prevState.ejes[0]) {
          travel = travel + nextState.ejes[0] - prevState.ejes[0];
        } else {
          travel = travel + prevState.ejes[0] - nextState.ejes[0];
        }
        break;
      case 'y':
        nextState.ejes[1] = parseFloat(args[j].slice(1));
        if (nextState.ejes[1] > prevState.ejes[1]) {
          travel = travel + nextState.ejes[1] - prevState.ejes[1];
        } else {
          travel = travel + prevState.ejes[1] - nextState.ejes[1];
        }
        break;
      case 'z':
        nextState.ejes[2] = parseFloat(args[j].slice(1));
        if (nextState.ejes[2] > prevState.ejes[2]) {
          travel = travel + nextState.ejes[2] - prevState.ejes[2];
        } else {
          travel = travel + prevState.ejes[2] - nextState.ejes[2];
        }
        break;
      case 'f':
        nextState.f = parseFloat(args[j].slice(1));
        break;
      default:
        throw new Error('error que no entiendo este argumento' + '<' + args[j] + '>')
    }
  }
  nextState.travel = travel;
}

function G92(prevState, nextState, command, args) {
  console.error('Codigo con coordenadas no intepretadas. \n GCode; ', command);
}

function G91(prevState, nextState, command, args) {
  console.error('Codigo con coordenadas no intepretadas. \n GCode; ', command);
}

function ignorar(prevState, nextState, command, args) {
  nextState.implemented = false;
  console.warn("Ignorar GCode: ", command);
}

var interpretarGCode = {
  "G0": G0,
  "G00": G0,
  "G1": G0,
  "G01": G0,

  "G92": G92,
  "G91": G91,

  "G28": ignorar,
  "G90": ignorar,
  "M82": ignorar,
  "M3": ignorar,
  "G21": ignorar,
  "M107": ignorar,
  "M104": ignorar,
  "M109": ignorar
}

function Line(ejes, f, code, travel) {
  this.ejes = ejes;
  this.f = f;
  this.code = code;
  this.travel = travel;
  this.implemented = true;
}

Line.prototype.clone = function () {
  return new Line(this.ejes.slice(), this.f, this.code, this.travel);
}

function inicializarLine(initialLine) {
  return new Line(initialLine, 0, 'Linea inicial.', 0)
}

function nextLine(gcode, prevLine) {
  var nextLine = prevLine.clone();
  nextLine.code = gcode;
  var tokens = gcode.split(/\s+/);
  var command = tokens[0];
  var args = tokens.slice(1);
  var interp = interpretarGCode[command];
  if (interp) {
    interp(prevLine, nextLine, command, args);
  } else {
    throw new Error("No entiendo el GCode " + command)
  }
  return nextLine
}

function removeUnimplemented(history) {
  for (var i = 0; i < history.length; i++) {
    if (!history[i].implemented) {
      history.splice(i, 1);
    }
  }
  return history
}

function executeGCodes(gcodes, initialLine) {
  var history = [inicializarLine(initialLine)];
  for (var i = 0; i < gcodes.length; ++i) {
    let line = nextLine(gcodes[i], history[i]);
    process.send({ msj: 'tick', data: { ejes: line.ejes, perc: i / gcodes.length } });
    history.push(line);
  }
  return history;
}

//Parsing
function removeInLineComment(line) {
  // elimina comentario en línea a partir de una línea de código
  return line.replace(/\s*\(.*$|\s*;.*$/, '');
}

function parseGCode(fileContent) {
  // código dividido en líneas y extraer aquellos que son relevantes. También eliminar los comentarios en línea.
  var lines = fileContent.split(/\r\n|\n/);
  var gcode = [];
  for (var i = 0; i < lines.length; i++) {
    var stripped = lines[i].replace(/^N\d+\s+/, "");
    if (stripped.match(/^(G|M)/)) {
      let line = removeInLineComment(stripped);
      gcode.push(line);
    }
  }
  return gcode;
}

/*module.exports = (content, initialLine) => {
  var codigo = executeGCodes(parseGCode(content), initialLine);
  return removeUnimplemented(codigo);
}*/
function start(content, initialLine, cb) {
  var codigo = executeGCodes(parseGCode(content), initialLine);
  cb(removeUnimplemented(codigo));
}

process.on('message', (option) => {
  if (option.content && option.initialLine) {
    console.log('gCode line: ', option.initialLine);
    start(option.content, option.initialLine, (gcode) => {
      process.send({ msj: 'finished', data:{gcode} });
    });
  } else {//if (option.end)
    process.nextTick(() => {
      process.exit(0);
    });
  }
});