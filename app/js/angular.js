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
      if (this.file.line.progress > 16 || this.file.line.progress === 0) {
        let time = new Date().getTime() - this.time.start.getTime();
        let mileSecondsLeft = this.file.travel * time / trvl;
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
    "message": "CNC-ino.",
    "type": "none",
    "time": 3000
  })
  .value('config', {
    "motor": {
      "xy": {
        "time": 15,
        "steps": 4000,
        "advance": 15.37
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

  .directive('popupElement', function () {
    return {
      link: function (scope, element, attrs) {
        element.popup({
          variation: attrs.ngPopupVariatio || 'very wide, large',
          position: attrs.ngPopupPosition,
          content: attrs.ngPopup,
          title: attrs.ngPopupTitle,
          delay: {
            hide: 450
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
