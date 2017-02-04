/* global angular */
/* global $ */
/* global vis */
angular.controller('main',
['notify', 'ipc', 'cnc', '$scope', 'lineTable', 'config', 'statusBar', 'modalFactory',
function (notify, ipc, cnc, $scope, lineTable, config, statusBar, modalFactory) {
  'use strict'
  var modalProgress = modalFactory('modalProgress');
  var exceeds_x = false, exceeds_y = false;
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  $scope.lineTableShow = false;
  $scope.statusBar = statusBar;
  $scope.initialLine = '0,0,0';

  /**
   * Definition for switching between start and end time.
   */
  $scope.statisticHour = {
    option: true,
    label: "Hora Fin:",
    value: cnc.time.end,
    click: function () {
      if (this.option) {
        this.label = "Hora Inicio:";
        this.value = cnc.time.start;
      } else {
        this.label = "Hora Fin:";
        this.value = cnc.time.end;
      }
      this.option = !this.option;
    }
  }

  $scope.showPrefsImg2gcode = function () {
    ipc.send('show-prefs', 'img2gcode');
  }
  /**
   *  Event called by the context menu
   */
  ipc.on('show-lineTable', function (event, obj) {
    $scope.lineTableShow = !$scope.lineTableShow;
  });
  // Add up line in table.
  function addLine(line) {
    if ($scope.lineTable.length > 10) { $scope.lineTable.shift(); }
    $scope.lineTable.push(line);
  }

  /**
   * When the driver loads it asks it to look up arduino and informs.
   * Receives the configuration saved in config.json.
   */
  ipc.send('arduino');
  ipc.on('arduino-res', function (event, obj) {
    config = obj.config;
    notify(obj.message, obj.type);
    $scope.cnc.arduino = obj.type === 'success';
    ipc.send('globalShortcut', obj.type === 'success');
  });

  // Send choose file or recalculate g code with other initial coordinates to app.
  $scope.setFile = function (reSetFile) {
    notify('CNCino.', 'none');
    var initLine = $scope.initialLine.split(',');
    var initialLine = [
      parseInt(initLine[0]),
      parseInt(initLine[1]),
      parseInt(initLine[2])
    ];
    ipc.send('open-file', { initialLine, fileDir: reSetFile ? cnc.file.dir : undefined });
  }
  // Response of the request to read file, receives the g code and important data.
  ipc.on('open-file-res', function (event, file) {
    if (file.dir) {
      exceeds_x = false; exceeds_y = false;
      //console.log(file)
      $('title').text('CNCino - ' + file.name);
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.dir = file.dir;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;

      notify(file.name, 'info');
      // Create the Vis DataSet to display the g-code
      viewsGCode = new vis.DataSet();
      for (let index = 0, x = file.gcode.length; index < x; index++) {
        viewsGCode.add({ id: index, x: file.gcode[index].ejes[0], y: file.gcode[index].ejes[1], z: file.gcode[index].ejes[2] });
        // Notices of measurement larger than the worktable.
        if (!exceeds_x && file.gcode[index].ejes[0] * file.scale > file.workpiece.x) { exceeds_x = true; }
        if (!exceeds_y && file.gcode[index].ejes[1] * file.scale > file.workpiece.y) { exceeds_y = true; }
      }
      drawVisualization(viewsGCode);
    } else { modalProgress.hide(); }
  });

  /**
   * Send 'p' to arduino.
   */
  $scope.pausa = function () {
    $scope.cnc.time.pause = new Date();
    if (ipc.sendArd({code:'p'})) { notify('Orden de pausa', 'warning'); }
    if (cnc.file.line.run) { window.alert('No se recomienda pausar la ejecucion.'); }
  }
  /**
   * Send '0,0,0' to arduino.
   */
  $scope.parar = function () {
    if (ipc.sendArd({code:'0,0,0'})) {
      $('title').text('CNCino');
      notify('Orden de parar', 'success');
      $scope.cnc.file.line.interpreted = 0;
      $scope.cnc.file.line.progress = 0;
      $scope.cnc.file.line.run = 0;
      $scope.cnc.pause.steps[0] = 0;
      $scope.cnc.pause.steps[1] = 0;
      $scope.cnc.pause.steps[2] = 0;
      $scope.cnc.pause.status = false;
    }
  }
  /**
   * Send manual commands directly to arduino.
   */
  $scope.enviarDatos = function (cmd) {
    if (ipc.sendArd({ code: cmd })) {
      notify('Comando manual: ' + cmd, 'success');
      $scope.progressBar = 'indicating';
    }
  }
  /**
   * Builds commands from the X, Y, Z buttons.
   */
  var stepsmm = 'steps';
  $scope.inputStepsmm = '200';
  $scope.btnStepsmm = 'Pasos';
  $scope.setStepsmm = function () {
    if (stepsmm === 'steps') {
      stepsmm = 'mm';
      $scope.btnStepsmm = 'mm';
      $scope.btnStepsmmClass = ''
    } else {
      stepsmm = 'steps';
      $scope.btnStepsmm = 'Pasos';
    }
  };
  /**
   * Send orders from X, Y, Z buttons for arduino.
   */
  $scope.moverManual = function (num, eje, sense) {
    var code;
    num = stepsmm === 'steps' ? sense + num : num;
    switch (eje) {
      case "X": code = num + ",0,0"; break;
      case "Y": code = "0," + num + ",0"; break;
      case "Z": code = "0,0," + num; break;
      default: code = "0,0,0"; break;
    }
    // The mm will be converted into main.js
    ipc.sendArd({ code: code, type: stepsmm, sense: sense });
    notify("Enviado: " + code + " " + stepsmm, "question");
  }

  /**
  * This event is triggered when you type a line in arduino to inform the result of the execution and to take necessary actions.
  * obj { type, message, data }
  */
  ipc.on('close-conex', function (event, obj) {
    modalProgress.hide();
    console.log('close-conex', obj);
    ipc.send('contextmenu-enabled', false);
    ipc.send('globalShortcut', false);
    switch (obj.type) {
      case "version":
        $scope.cnc.working = false;
        $scope.progressBar = 'success';
        ipc.send('globalShortcut', true);
        ipc.send('contextmenu-enabled', true);
        notify(obj.message, "info");
        addLine({code:'Arduino Code v: '+obj.data });
        break;
      case "info":
        $scope.cnc.working = true;
        $scope.progressBar = 'success';
        notify(obj.message, obj.type);
        addLine({code:obj.message});
        break;
      case "data":
        $scope.cnc.working = false;
        if (obj.data.steps[0] === '0' && obj.data.steps[1] === '0' && obj.data.steps[2] === '0') {
          //console.log('-->> Terminado <<--');
          ipc.send('globalShortcut', true);
          ipc.send('contextmenu-enabled', true);
          notify(obj.message, 'success');
          if (obj.data.line) {
            $scope.progressBar = 'success';
            $('title').text('CNCino' + $scope.cnc.file.name ? ' - ' + $scope.cnc.file.name : '');
          } else {
            $scope.progressBar = 'indicating';
          }
        } else {//Pause
          //console.log('-->> Pausado <<--');
          notify('Pausado en los pasos: ' + obj.data.steps, 'warning');
          addLine({code:"Pausado: " + obj.data.steps});
          $scope.progressBar = 'warning';
          cnc.pause.line = obj.data.line;
          cnc.pause.steps[0] = obj.data.steps[0];
          cnc.pause.steps[1] = obj.data.steps[1];
          cnc.pause.steps[2] = obj.data.steps[2];
          cnc.pause.status = true;
          //$scope.comando = cnc.pause.steps.toString();
        }
        break;
      case "error":
        //console.log('-->> Error <<--');
        notify(obj.message, obj.type);
        $scope.cnc.working = false;
        ipc.send('globalShortcut', false);
        ipc.send('contextmenu-enabled', true);
        break;
      default:
        //console.log('-->> Algo inesperado  <<--');
        notify("Algo inesperado...", "question");
        $scope.progressBar = 'warning';
        $scope.cnc.working = false;
    }
  });

  // This event is triggered when a gcode line is written in arduino to inform the state of the execution and to take necessary actions.
  ipc.on('add-line', function (event, data) {
    console.log('add-line', data);
    // Disable command and menu keys that can interrupt execution
    ipc.send('contextmenu-enabled', false);
    ipc.send('globalShortcut', false);
    // Add up line in table.
    addLine({
      code: data.line.code,
      ejes: data.line.ejes  || [0,0,0],
      steps :data.line.steps || [0,0,0],
      travel: data.line.travel || '',
      nro: data.nro  || ''
    });
    // Show info  on status bar.
    notify('Trabajando con ' + data.line.code, 'info');

    if (data.nro && data.line.travel) {
      $scope.cnc.Progress(data.line.travel);
      $('title').text('CNCino - ' + $scope.cnc.file.line.progress + "% - " + $scope.cnc.file.name);
      // Sends percentage for counter in windows environment (In EletronJS app).
      ipc.send('taksBar-progress', $scope.cnc.file.line.progress / 100);
      // Update end time.
      $scope.$watch('cnc.time.end', function () {
        if ($scope.statisticHour.option) {
          $scope.statisticHour.value = cnc.time.end;
        } else {
          $scope.statisticHour.value = cnc.time.start;
        }
      });
    }
  });

  $scope.start = function () {
    if (!cnc.pause.status) {
      $scope.cnc.file.line.run = 0;
      $scope.lineTable = [];
      $scope.cnc.time.start = new Date();
      $scope.cnc.time.end = new Date(new Date().getTime() + $scope.cnc.file.line.duration);
      ipc.startArd({ follow: false, steps: [0, 0, 0] });
    } else { // pause
      if ($scope.cnc.file.line.run !== 0) {//si paras en linea 0 esto andaria mal
        ipc.startArd({ follow: true, steps: cnc.pause.steps });
        $scope.cnc.time.end = new Date($scope.cnc.time.end.getTime() + $scope.cnc.time.pause.getTime());
      } else {
        ipc.sendArd({ code: cnc.pause.steps });
      }
      $scope.cnc.pause.status = false;
      $scope.cnc.time.pause = '--:--'
      $scope.cnc.steps = [0, 0, 0];
    }
    $scope.progressBar = 'indicating';
  }

  // Specifications to create the g-code view
  var viewsGCode = null, graph = null;
  function drawVisualization(data) {
    // Notices of measurement larger than the worktable.
    if (exceeds_x) { notify('El modelo se excede en X.', 'warning'); }
    if (exceeds_y) { notify('El modelo se excede en Y.', 'warning'); }
    // See grille when starting.
    if (data === undefined) {
      data = new vis.DataSet();
      data.add({ x: 0, y: 0, z: 0 });
    }
    // specify options
    var options = {
      width: '100%',
      height: '100%',
      style: 'line',
      showPerspective: false,
      showGrid: true,
      keepAspectRatio: true,
      verticalRatio: 0.5
    };
    var container = document.getElementById('mygraph');
    graph = new vis.Graph3d(container, data, options);
    //graph.setCameraPosition(0.4, undefined, undefined);

    // When the view is generated we remove the load dialog
    $("#loader").removeClass("active");
    modalProgress.hide();
  } drawVisualization();

  /**
   * Progress information when opening a file.
   */
  ipc.on('open-file-tick', function (event, data) {
    modalProgress.show();
    $('#modalProgressInfo').text(data.info);
  });



}]);
// para marcar el recorido usar dos grupos
// uno indica lo recorido y el otro lo que falta
// cada linea procesas  cambiarla de grupo por medio del id
