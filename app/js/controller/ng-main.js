/* global angular */
/* global $ */
/* global vis */
angular.controller('main',
[ 'notify','ipc','cnc','$scope','lineTable','config','line','statusBar',
( notify,ipc,cnc,$scope,lineTable,config,line,statusBar) => {
'use strict'
  var exceeds_x = false, exceeds_y = false; lineTable.show = false;
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  $scope.statusBar = statusBar;
  $scope.initialLine = '0,0,0';

  $scope.statisticHour = {
    option: true,
    label : "Hora Fin:",
    value : cnc.time.end,
    click : function () {
      if (this.option) {
        this.label = "Hora Inicio:";
        this.value = cnc.time.start;
      }else{
        this.label = "Hora Fin:";
        this.value = cnc.time.end;
      }
	    this.option = !this.option;
    }
  }

  ipc.on('show-lineTable',(event, obj) => { lineTable.show = !lineTable.show; });
  ipc.send('arduino');
  ipc.on('arduino-res', (event, obj) => {
    config = obj.config;
    cnc.arduino = obj.type === 'success' ;
    notify(obj.msg, obj.type);
  });

  $scope.setFile = (reSetFile) => {
    let initialLine = $scope.initialLine.split(',');
    initialLine[0] = parseInt(initialLine[0]);
    initialLine[1] = parseInt(initialLine[1]);
    initialLine[2] = parseInt(initialLine[2]);
    ipc.send('open-file', { initialLine  , fileDir: reSetFile? cnc.file.name : undefined});
  }
  ipc.on('open-file-res', (event, file) => {
    if ( file.dir ){
      //console.log(file)
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;
      $('title').text('CNC-ino - '+file.name);
      notify(file.name, 'info');

      // Cargar Views
      var data = new vis.DataSet();
      for (let index = 0; index < file.gcode.length; index++) {
        if( !exceeds_x && file.gcode[index].ejes[0] * file.scale > file.workpiece.x){ exceeds_x = true; }
        if( !exceeds_y && file.gcode[index].ejes[1] * file.scale > file.workpiece.y){ exceeds_y = true; }
        data.add({ id : index , x : file.gcode[index].ejes[0], y : file.gcode[index].ejes[1], z : file.gcode[index].ejes[2] });
      }
      drawVisualization(data);      
    }
  });

  $scope.enviarDatos = (cmd) => {
    if(ipc.sendArd(cmd)){ notify( 'Comando manual: '+cmd , 'success' ); }
  }
  $scope.moverOrigen = () => {
    if(ipc.sendArd('o') ){ notify( 'Comando mover al origen.' , 'success' ); }
  }
  $scope.pausa = () => { 
    window.alert('No se recomienda pausar la ejecucion.')
    $scope.cnc.time.pause = new Date();
    if(ipc.sendArd('p')){ notify( 'Orden de pausa' , 'warning' ); }
  }
  $scope.parar = () => {
    if(ipc.sendArd('0,0,0')){
      $('title').text('CNC-ino');

      notify( 'Orden de parar' , 'success' );

      $scope.cnc.file.line.interpreted = 0;
      $scope.cnc.file.line.progress = 0;
      $scope.cnc.pause.steps[0]=0;
      $scope.cnc.pause.steps[1]=0;
      $scope.cnc.pause.steps[2]=0;
      $scope.cnc.pause.status=false;
    }
  }

  var stepsmm = 'steps';
  $scope.inputStepsmm = '200';
  $scope.btnStepsmm = 'Pasos';
  $scope.btnStepsmmClass = 'uk-active'
  $scope.setStepsmm = () => {
    if(stepsmm === 'steps'){
      stepsmm='mm';
      $scope.btnStepsmm = 'mm';
      $scope.btnStepsmmClass = ''
    }else{
      stepsmm='steps';
      $scope.btnStepsmm = 'Pasos';
      $scope.btnStepsmmClass = 'uk-active'
    }
  };

  $scope.moverManual = (num,eje,sentido) => {
    let cmd;
    switch (eje) {
      case "X": cmd = sentido+num+",0,0"    ; break;
      case "Y": cmd = "0,"+sentido+num+",0" ; break;
      case "Z": cmd = "0,0,"+sentido+num    ; break;
      default:  cmd = "0,0,0"               ; break;
    }
    var l =  line.codeType(cmd , stepsmm) ;
    if(ipc.sendArd( l.steps.toString()) ) {
      line.add(l);
      $scope.comando  =  '';
    }
  }

  ipc.on('close-conex', (event,obj) => {
    console.log('close-conex',obj);
    switch(obj.type){
      case "info":
        $scope.cnc.working = true;
        $scope.progressBar = 'success';
        notify(obj.msg, obj.type);
      break;
      case "none":
        $scope.cnc.working = false;
        if(obj.steps[0]==='0' && obj.steps[1]==='0' && obj.steps[2]==='0'){
          console.log(obj.steps.toString(),'-->> Terminado <<--');
          notify(obj.msg,'success');
          $scope.progressBar = 'success';
        }else{//Pause
          console.log(obj.line,obj.steps.toString(),'-->> Pausado <<--');
          notify( 'Pausado en los pasos: '+obj.steps,'warning' );
          $scope.progressBar = 'warning';
          cnc.pause.line      =  obj.line ;
          cnc.pause.steps[0]  =  obj.steps[0];
          cnc.pause.steps[1]  =  obj.steps[1];
          cnc.pause.steps[2]  =  obj.steps[2];
          cnc.pause.status    =  true;
          $scope.comando      =  cnc.pause.steps.toString();
        }
      break;
      case "error":
        notify(obj.msg, obj.type);
        $scope.cnc.working = false;
      break;
      default:
        console.log('Algo inesperado...');
        notify("Algo inesperado...","question");
        $scope.progressBar = 'warning';
        $scope.cnc.working = false;
    }
  }); 

  ipc.on('add-line', (event, data) => { 
    //graficar trabajo. :D
    if($scope.lineTable.length > 10) $scope.lineTable.shift();
    $scope.lineTable.push( line.new( data.line.code, data.line.ejes, undefined, data.line.travel, data.nro));

    notify('Trabajando con '+data.line.code,'info');

    if(data.nro && data.line.travel){
      $scope.cnc.file.Progress(data.nro,data.line.travel);
      $('title').text('CNC-ino - '+$scope.cnc.file.line.progress+"% - "+$scope.cnc.file.name);

      ipc.send('taksBar-progress',$scope.cnc.file.line.progress/100);

      if($scope.cnc.file.Progress>30 || $scope.cnc.file.Progress===0){
        $scope.cnc.time.calcEnd($scope.cnc.file.line);
      }
      $scope.$watch('cnc.time.end',()=>{ 
        if($scope.statisticHour.option){ $scope.statisticHour.value = cnc.time.end; }
        else{ $scope.statisticHour.value = cnc.time.start; }
      });

    }
  });

  $scope.start = () => {
    if(!cnc.pause.status){
      $scope.lineTable = [];
      $scope.cnc.time.start = new Date();
      $scope.cnc.time.end = new Date( new Date().getTime() + $scope.cnc.file.line.duration );
      ipc.startArd({follow:false, steps:[0,0,0]});
    }else{ // pausa
      $scope.cnc.pause.status = false;
      $scope.cnc.steps = [0,0,0];
      // saber cunato tiempo estuvo parado y sumar
      $scope.cnc.time.end = new Date(
        $scope.cnc.time.end.getTime() + $scope.cnc.time.pause.getTime()
      );
      //
      $scope.cnc.time.pause = '--:--'
      ipc.startArd({follow : true, steps: cnc.pause.steps });
    }
    $scope.progressBar = 'indicating';
  }

  var data = null, graph = null;
  function drawVisualization(data) {
    if(exceeds_x){ notify( 'El modelo se excede en X.', 'warning' ); }
    if(exceeds_y){ notify( 'El modelo se excede en Y.', 'warning' ); }

    if(data === undefined){
      data = new vis.DataSet();
      data.add({ x:0, y:0, z:0 });
    }
    // specify options
    var options = {
      width:  '100%',
      height: '100%',
      style: 'line',
      showPerspective: false,
      showGrid: true,
      keepAspectRatio: true,
      verticalRatio: 0.5
    };
    // create our graph
    var container = document.getElementById('mygraph');
    graph = new vis.Graph3d(container, data, options);
    //graph.setCameraPosition(0.4, undefined, undefined);
    // terminar loading.
  }drawVisualization();

}]);
// para marcar el recorido usar dos grupos
// uno indica lo recorido y el otro lo que falta
// cada linea procesas  cambiarla de grupo por medio del id