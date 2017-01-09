/* global electron */
/* global angular */
/* global $ */
angular
  .value('cnc', {
    arduino: false,
    working: false,
    pause: {
      line: 0,
      status: false,
      steps: [0, 0, 0, 0]
    },
    file: {
      //gcode : [],
      name: 'Sin Archivo.',
      line: {
        total: 0,
        run: 0,
        duration: 0,
        progress: 0
      },
      travel: 0
    },
    Progress: function (trvl) {
      // this = cnc
      this.file.line.run++;
      this.file.line.progress = ((trvl * 100) / this.file.travel).toFixed(2);
      if ( trvl > 0  && this.file.line.progress > 1) {
        var workTime = new Date().getTime() - this.time.start.getTime();
        var mileSecondsLeft = this.file.travel * workTime / trvl;
        this.time.end = new Date(this.time.start.getTime() + mileSecondsLeft);
      }
    },
    time: {
      pause: '--:--',
      start: '--:--',
      end: '--:--'
    }
  })
  .value('lineTable', [])
  .value('statusBar', {
    "message": "CNCino.",
    "type": "none",
    "time": 3000
  })
// Used to save settings and calculations.
  .value('config', {
    "motor": {
      "y": {
        "time": 17,
        "steps": 10000,
        "advance": 63
      },
      "x": {
        "time": 17,
        "steps": 10000,
        "advance": 63
      },
      "z": {
        "steps": 2000,
        "advance": 19
      }
    }
  })

/**
 * Directives to integrate semantic-ui with angularjs
 */
  .directive('checkbox', function () {
    return {
      link: function (scope, element, attrs) {
        element.checkbox();
      }
    }
  })
  .directive('popupElement', function () {
    return {
      link: function (scope, element, attrs) {
        element.popup({
          variation: attrs.ngPopupVariatio || 'very wide, large',
          position: attrs.ngPopupPosition,
          content: attrs.ngPopup,
          title: attrs.ngPopupTitle,
          delay: {
            show: 150,
            hide: 0
          }
        });
      }
    }
  })
  .directive('ngPopup', function () {
    return {
      link: function (scope, element, attrs) {
        element.popup({
          popup: $(attrs.id)
        });
      }
    }
  })
