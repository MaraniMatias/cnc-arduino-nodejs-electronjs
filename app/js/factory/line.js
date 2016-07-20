/*
xy
  steps   10000
  advance 115.47 
z
  steps   2000
  advance 7.00
*/
angular.factory('line', ['lineTable','config' ,(lineTable,config) => {
  function toEjes(c){
    return [
      c[0] * config.motor.xy.advance / config.motor.xy.steps,
      c[1] * config.motor.xy.advance / config.motor.xy.steps,
      c[2] * config.motor.z.advance  / config.motor.z.steps
    ]
  }
  function toSteps(c){
    return [
      Math.round(c[0] * (config.motor.xy.steps / config.motor.xy.advance)),
      Math.round(c[1] * (config.motor.xy.steps / config.motor.xy.advance)),
      Math.round(c[2] * (config.motor.z.steps  / config.motor.z.advance))
    ]
  }
  return {
    add : function (line) {
      if(lineTable.length > 12){ 
        lineTable.shift();
      }
      lineTable.push(line);
    },
    new : function (code,ejes,steps,travel,nro,type) {
      switch(type){ // in new css not working
        case 1: type='positive'; break;
        case 2: type='active'; break;
        case 3: type='warning';break;
        case 4: type='negative';break;
        case 5: type='disabled';break;
        default:type='';
      }
      return {
        travel : travel === undefined? '' : travel,
        steps  : steps  === undefined && ejes !== undefined ? toSteps(ejes) : steps,
        type   ,
        ejes   : ejes   === undefined && steps !== undefined? toEjes(steps) : ejes,
        nro    : nro    === undefined? '' : nro,
        code
      }
    },
    codeType : function (c , t) {
      if(t === 'steps'){
        return {
          travel:'',
          nro:'',
          type : 'none',
          code : `Comando manual: ${c}`,
          steps : c.split(','),
          ejes : toEjes(c.split(','))
        }
      }else if(t === 'mm'){
        return {
          travel:'',
          nro:'',
          type : 'none',
          code : `Comando manual: ${c} ${t}`,
          ejes : c.split(','),
          steps : toSteps(c.split(','))
        }
      }else{
        return {
          code : `Comando manual ${t}: ${c}`,
          travel:'',
          nro:'',
          type : 'none'
        }
      }
    },
    addMsj: function  (msg,type) {
      if(lineTable.length > 14){ 
        lineTable.shift();
      }
      switch(type){
        case 1: type='positive'; break;
        case 2: type='active'; break;
        case 3: type='warning';break;
        case 4: type='negative';break;
        case 5: type='disabled';break;
        default:type='';
      }
      lineTable.push({nro:'',ejes:[],type,code:msg,steps:[]});
    }  
  }// return
}]);