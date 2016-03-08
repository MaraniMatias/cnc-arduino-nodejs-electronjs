/* global electron */
/* global angular */
/* global $ */
/* global io */
angular
.value('cnc',{
  arduino:false,
  working:false,
  pause:{
    line: 0,
    status: false,
    steps: [0,0,0]
  },
  file:{
    //gcode : [],
    name:'Sin Archivo',
    line: {
      total : 0,
      interpreted : 0,
      duration : 0,
      progress : 0
    },
    travel:0,
    Progress:  (nro,trvl) => {
      nro++;
      this.line.interpreted = nro;
      this.line.progress = ((trvl*100)/this.travel).toFixed(2);
    }
  },
  time:{
    pause:'--:--',
    start:'--:--',
    end:'--:--'
  }
})
.value('lineTable', [])
.value('config', {
   "motor": {
    "xy": {
      "time": 24,
      "steps": 10000,
      "advance": 115.47
    },
    "z": {
      "steps": 2000,
      "advance": 7.00
    }
  }
})
.directive('popupTable', function () {
  return {
    link: function (scope, element, attrs) {
      if(scope.line.steps !== undefined ){
        element.popup({ 
          title     : 'Pasos',
          position : 'top center',
          variation : 'inverted'
          
        });
      }
    }
  }
});