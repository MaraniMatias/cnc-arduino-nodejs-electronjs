/* global angular */
/* global $ */
/* global vis */
angular.controller('main',
['notify', 'ipc', 'cnc', '$scope', 'lineTable', 'config', 'line', 'statusBar', 'modalFactory',
(notify, ipc, cnc, $scope, lineTable, config, line, statusBar, modalFactory ) => {
  'use strict'
  var modalProgress = modalFactory('modalProgress');
  var exceeds_x = false, exceeds_y = false;
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  $scope.lineTableShow = false;
  $scope.statusBar = statusBar;
  $scope.initialLine = '0,0,0';

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

  ipc.on('show-lineTable', (event, obj) => { $scope.lineTableShow = !$scope.lineTableShow; });
  ipc.send('arduino');
  ipc.on('arduino-res', (event, obj) => {
    console.log(obj);
    config = obj.config;
    notify(obj.msg, obj.type);
    $scope.cnc.arduino = obj.type === 'success';
    ipc.send('globalShortcut', obj.type === 'success');
  });

  $scope.setFile = (reSetFile) => {
    let initLine = $scope.initialLine.split(',');
    let initialLine = [parseInt(initLine[0]), parseInt(initLine[1]), parseInt(initLine[2])];
    ipc.send('open-file', { initialLine, fileDir: reSetFile ? cnc.file.dir : undefined });
  }

  ipc.on('open-file-res', (event, file) => {
    if (file.dir) {
      exceeds_x = false; exceeds_y = false;
      //console.log(file)
      $('title').text('CNC-ino - ' + file.name);
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.dir = file.dir;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;

      notify(file.name, 'info');

      viewsGCode = new vis.DataSet();
      for (let index = 0, x = file.gcode.length; index < x; index++) {
        if (!exceeds_x && file.gcode[index].ejes[0] * file.scale > file.workpiece.x) { exceeds_x = true; }
        if (!exceeds_y && file.gcode[index].ejes[1] * file.scale > file.workpiece.y) { exceeds_y = true; }
        viewsGCode.add({ id: index, x: file.gcode[index].ejes[0], y: file.gcode[index].ejes[1], z: file.gcode[index].ejes[2] });
      }
      drawVisualization(viewsGCode);
    }else{ modalProgress.hide(); }
  });

  $scope.enviarDatos = (cmd) => {
    if (ipc.sendArd(cmd)) {
      notify('Comando manual: ' + cmd, 'success');
      $scope.progressBar = 'indicating';
    }
  }
  /*$scope.moverOrigen = () => {
    if(ipc.sendArd('o') ){
      notify( 'Comando mover al origen.' , 'success' );
      $scope.progressBar = '';
    }
  }*/
  $scope.pausa = () => {
    $scope.cnc.time.pause = new Date();
    if (ipc.sendArd('p')) { notify('Orden de pausa', 'warning'); }
    if (cnc.file.line.run) { window.alert('No se recomienda pausar la ejecucion.'); }
  }
  $scope.parar = () => {
    if (ipc.sendArd('0,0,0')) {
      $('title').text('CNC-ino');

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

  var stepsmm = 'steps';
  $scope.inputStepsmm = '200';
  $scope.btnStepsmm = 'Pasos';
  $scope.setStepsmm = () => {
    if (stepsmm === 'steps') {
      stepsmm = 'mm';
      $scope.btnStepsmm = 'mm';
      $scope.btnStepsmmClass = ''
    } else {
      stepsmm = 'steps';
      $scope.btnStepsmm = 'Pasos';
    }
  };

  $scope.moverManual = (num, eje, sentido) => {
    let cmd;
    switch (eje) {
      case "X": cmd = sentido + num + ",0,0"; break;
      case "Y": cmd = "0," + sentido + num + ",0"; break;
      case "Z": cmd = "0,0," + sentido + num; break;
      default: cmd = "0,0,0"; break;
    }
    var l = line.codeType(cmd, stepsmm);
    if (ipc.sendArd(l.steps.toString())) {
      line.add(l);
      $scope.comando = '';
    }
  }

  ipc.on('close-conex', (event, obj) => {
    modalProgress.hide();
    console.log('close-conex', obj);
    ipc.send('contextmenu-enabled', true);
    ipc.send('globalShortcut', false);
    switch (obj.type) {
      case "info":
        $scope.cnc.working = true;
        $scope.progressBar = 'success';
        notify(obj.msg, obj.type);
        break;
      case "none":
        $scope.cnc.working = false;
        if (obj.steps[0] === '0' && obj.steps[1] === '0' && obj.steps[2] === '0') {
          console.log('-->> Terminado <<--');
          notify(obj.msg, 'success');
          if (obj.line) {
            $scope.progressBar = 'success';
            $('title').text('CNC-ino' + $scope.cnc.file.name ? ' - ' + $scope.cnc.file.name : '');
          } else {
            $scope.progressBar = 'indicating';
          }
        } else {//Pause
          console.log('-->> Pausado <<--');
          notify('Pausado en los pasos: ' + obj.steps, 'warning');
          $scope.progressBar = 'warning';
          cnc.pause.line = obj.line;
          cnc.pause.steps[0] = obj.steps[0];
          cnc.pause.steps[1] = obj.steps[1];
          cnc.pause.steps[2] = obj.steps[2];
          cnc.pause.status = true;
          $scope.comando = cnc.pause.steps.toString();
        }
        break;
      case "error":
        console.log('-->> Error <<--');
        notify(obj.msg, obj.type);
        $scope.cnc.working = false;
        break;
      default:
        console.log('-->> Algo inesperado  <<--');
        notify("Algo inesperado...", "question");
        $scope.progressBar = 'warning';
        $scope.cnc.working = false;
    }
  });

  ipc.on('add-line', (event, data) => {
    ipc.send('contextmenu-enabled', false);
    ipc.send('globalShortcut', true);
    line.add(line.new(data.line.code, data.line.ejes, undefined, data.line.travel, data.nro));
    notify('Trabajando con ' + data.line.code, 'info');

    if (data.nro && data.line.travel) {
      $scope.cnc.Progress(data.line.travel);
      $('title').text('CNC-ino - ' + $scope.cnc.file.line.progress + "% - " + $scope.cnc.file.name);

      ipc.send('taksBar-progress', $scope.cnc.file.line.progress / 100);

      $scope.$watch('cnc.time.end', () => {
        if ($scope.statisticHour.option) { $scope.statisticHour.value = cnc.time.end; }
        else { $scope.statisticHour.value = cnc.time.start; }
      });
    }

  });

  $scope.start = () => {
    if (!cnc.pause.status) {
      $scope.cnc.file.line.run = 0;
      $scope.lineTable = [];
      $scope.cnc.time.start = new Date();
      $scope.cnc.time.end = new Date(new Date().getTime() + $scope.cnc.file.line.duration);
      ipc.startArd({ follow: false, steps: [0, 0, 0] });
    } else { // pausa
      if ($scope.cnc.file.line.run !== 0) {//si paras en linea 0 esto andaria mal
        ipc.startArd({ follow: true, steps: cnc.pause.steps });
        // saber cunato tiempo estuvo parado y sumar
        $scope.cnc.time.end = new Date(
          $scope.cnc.time.end.getTime() + $scope.cnc.time.pause.getTime()
        );
      } else {
        ipc.sendArd(cnc.pause.steps);
      }
      $scope.cnc.pause.status = false;
      $scope.cnc.time.pause = '--:--'
      $scope.cnc.steps = [0, 0, 0];
    }
    $scope.progressBar = 'indicating';
  }

  var viewsGCode = null, graph = null;
  function drawVisualization(data) {
    if (exceeds_x) { notify('El modelo se excede en X.', 'warning'); }
    if (exceeds_y) { notify('El modelo se excede en Y.', 'warning'); }

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
    $("#loader").removeClass("active");
    modalProgress.hide();
  } drawVisualization();

  ipc.on('open-file-tick', (event, data) => {
    modalProgress.show();
    $('#modalProgressInfo').text(data.info);
  });
  $scope.showPrefsImg2gcode = () => {
    ipc.send('show-prefs', 'img2gcode');
  }

}]);
// para marcar el recorido usar dos grupos
// uno indica lo recorido y el otro lo que falta
// cada linea procesas  cambiarla de grupo por medio del id