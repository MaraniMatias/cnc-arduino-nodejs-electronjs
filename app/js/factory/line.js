angular.factory('line', ['lineTable', 'config', '$rootScope', function (lineTable, config, $rootScope) {
  function toEjes(c) {
    return [
      c[0] * config.motor.xy.advance / config.motor.xy.steps,
      c[1] * config.motor.xy.advance / config.motor.xy.steps,
      c[2] * config.motor.z.advance / config.motor.z.steps
    ]
  }
  function toSteps(c) {
    return [
      Math.round(c[0] * (config.motor.xy.steps / config.motor.xy.advance)),
      Math.round(c[1] * (config.motor.xy.steps / config.motor.xy.advance)),
      Math.round(c[2] * (config.motor.z.steps / config.motor.z.advance))
    ]
  }
  return {
    /*add: function (line) {
      if (lineTable.length > 10) {
        lineTable.shift();
      }
      lineTable.push(line);
      $rootScope.$apply();
    },*/
    /**
    * Normalizes the lines of code to show them in the table.
    */
    new: function (code, ejes, steps, travel, nro, type) {
      switch (type) { // in new css not working
        case 1: type = 'positive'; break;
        case 2: type = 'active'; break;
        case 3: type = 'warning'; break;
        case 4: type = 'negative'; break;
        case 5: type = 'disabled'; break;
        default: type = '';
      }
      return {
        travel: travel || '',
        steps: steps === undefined && ejes && toSteps(ejes) || steps,
        type,
        ejes: ejes === undefined && steps && toEjes(steps) || ejes,
        nro: nro || '',
        code
      }
    }/*,
    /**
    * Using in ng-main for $scope.moverManual 
    *//*
    codeType: function (c, t) {
      if (t === 'steps') {
        return {
          travel: '',
          nro: '',
          type: 'none',
          code: 'Comando manual: '+c,
          steps: c.split(','),
          ejes: toEjes(c.split(','))
        }
      } else if (t === 'mm') {
        return {
          travel: '',
          nro: '',
          type: 'none',
          code: 'Comando manual: '+ c +' '+ t,
          ejes: c.split(','),
          steps: toSteps(c.split(','))
        }
      } else {
        return {
          code: 'Comando manual '+ t +': '+c,
          travel: '',
          nro: '',
          type: 'none'
        }
      }
    }*/
  }// return
}]);
