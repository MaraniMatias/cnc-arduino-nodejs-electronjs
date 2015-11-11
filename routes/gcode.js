function G0(prevState, nextState, command, args) {
  for(var j=0; j<args.length; j++)  {
    switch(args[j].charAt(0).toLowerCase()){
      case 'x':
        nextState.ejes[0]=parseFloat(args[j].slice(1));
        break;
      case 'y':
        nextState.ejes[1]=parseFloat(args[j].slice(1));
        break;
      case 'z':
        nextState.ejes[2]=parseFloat(args[j].slice(1));
        break;
      case 'f':
        nextState.f=parseFloat(args[j].slice(1));
        break;
      default:  
        throw new Error('error que no entiendo este argumento' + '<'+args[j]+'>')
        break;    
    }
  }
}

function G92(prevState, nextState, command, args){
  console.error('Codigo con coordenadas no intepretadas. \n GCode; ',command);
}

function G91(prevState, nextState, command, args) {
  console.error('Codigo con coordenadas no intepretadas. \n GCode; ',command);
}

function ignorar(prevState, nextState, command, args) {
  nextState.implemented = false;
  console.warn("Ignorar GCode: ", command);
}


//module.exports = {
var interpretarGCode = {
  "G0" : G0,
  "G00": G0,
  "G1" : G0,
  "G01": G0,
  
  "G92": G92,
  "G91": G91,
  
  "G28" : ignorar,
  "G90" : ignorar,
  "M82" : ignorar,
  "M3"  : ignorar,
  "G21" : ignorar,
  "M107": ignorar,
  "M104": ignorar,
  "M109": ignorar
}

function Linea(ejes, f, code) {
	this.ejes = ejes;
	this.f = f;		
  this.code = code;
	this.implemented = true;
}

Linea.prototype.clone = function() {
	return new Linea(this.ejes.slice(),this.f,this.code);
}

function inicializarLinea(){
	return new Linea([0,0,0], 0, 'Linea inicial.')
}

function nextLinea(gcode, prevLinea){
	var nextLinea = prevLinea.clone();
	nextLinea.code = gcode;
	var tokens = gcode.split(/\s+/);
	var command = tokens[0];
	var args = tokens.slice(1);
	var interp = interpretarGCode[command];
	if(interp){
		interp(prevLinea, nextLinea, command, args);
	}else{
		throw new Error("No entiendo el GCode " + command)
	}
	return nextLinea
}

function removeUnimplemented(history){
	for(var i=0; i<history.length; i++)	{
			if(!history[i].implemented){
				history.splice(i,1);
			}
	}
	return history
}

function executeGCodes(gcodes) {
	var history = [ inicializarLinea() ];
	for(var i=0; i<gcodes.length; ++i){
		history.push(nextLinea(gcodes[i], history[i]));
	}
	return history;
}

//Parsing
function removeInLineComment(line) {
  // elimina comentario en línea a partir de una línea de código
  return line.replace(/\s*;.*$/, '');
}

function parseGCode(fileContent) {
  // código dividido en líneas y extraer aquellos que son relevantes. También eliminar los comentarios en línea.
  var lines = fileContent.split(/\r\n|\n/);
	var gcode = [];
	for(var i=0;i<lines.length;i++) {
		var stripped = lines[i].replace(/^N\d+\s+/, "")
		if(stripped.match(/^(G|M)/)) {
			gcode.push(removeInLineComment(stripped));
		}
	}
	return gcode;
}

module.exports = function (content){
//var moduloGCode = function (content){
	var codigo =  executeGCodes(parseGCode(content));
  return removeUnimplemented(codigo);
}
//module.exports = moduloGCode;

//var fs = require('fs');
//var fileDir = './g-code/g0_0001.ngc';
//var data = fs.readFileSync(fileDir);
//var fileContent = data.toString();
//var history = moduloGCode(fileContent);
//console.log(history);