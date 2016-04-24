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
    name:'Sin Archivo.',
    line: {
      total : 0,
      run : 0,
      duration : 0,
      progress : 0
    },
    travel:0,
    Progress: function  (nro,trvl) {
      nro++;
      this.line.run = nro;
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
      "steps": 4000,
      "advance": 29.37
    },
    "z": {
      "steps": 2000,
      "advance": 14
    }
  }
})
.directive('checkbox', function () {
  return {
    link: function (scope, element, attrs) {
        element.checkbox();
    }
  }
})
/*.directive('popupTable', function () {
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
})*/
;