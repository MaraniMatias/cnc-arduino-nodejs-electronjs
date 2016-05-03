/* global angular */
/* global $ */
/* global vis */
angular.controller('main',
[ 'notify','ipc','cnc','$scope','lineTable','config','line',
( notify,ipc,cnc,$scope,lineTable,config,line) => {
'use strict'
  var exceeds_x = false, exceeds_y = false;
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  $scope.initialLine = '0,0,0';
  
  ipc.send('arduino');
  ipc.on('arduino-res', (event, obj) => {
    config = obj.config;
    cnc.arduino = obj.type === 'success' ;
    notify( obj.msg, obj.type );
  });
  
  $scope.setFile = () => {
    let arrayLine = $scope.initialLine.split(',');
    arrayLine[0] = parseInt(arrayLine[0]);
    arrayLine[1] = parseInt(arrayLine[1]);
    arrayLine[2] = parseInt(arrayLine[2]);
    ipc.send('open-file', arrayLine );
  }
  ipc.on('open-file-res', (event, file) => {
    if ( file.dir ){
      //console.log(file)
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;
      notify( file.name );
            
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
    if(ipc.sendArd(cmd)) notify( 'Comando manual: '+cmd , 'success' );
  }
  $scope.moverOrigen = () => {
    if(ipc.sendArd('o') )  notify( 'Comando mover al origen.' , 'success' );
  }
  $scope.pausa = () => { 
    window.alert('No se recomienda pausar la ejecucion.')
    $scope.cnc.time.pause = new Date();
    if(ipc.sendArd('p'))   notify( 'Orden de pausa' , 'warning' );
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
    if(obj.type == 'none' && obj.steps[0]==='0' && obj.steps[1]==='0' && obj.steps[2]==='0'){
      console.log(obj.steps.toString(),'-> Emit -->> Terminado <<--');
      notify( 'Terminado: '+obj.steps );
      $scope.progressBar = 'uk-progress-success';
  }else if(obj.type != 'none'){
      console.log(obj.steps,'Emit -->> indefinido <<--');
      notify( 'Respuesta: '+obj.nro+' - '+obj.result );
      $scope.progressBar = 'uk-progress-success';
    }else{//Pause
      console.log(obj.line,obj.steps.toString(),'Emit -->> Pausado <<--');
      notify( 'Pausado: '+obj.steps );
      $scope.progressBar = 'uk-progress-warning';
      cnc.pause.line      =  obj.line ;
      cnc.pause.steps[0]  =  obj.steps[0];
      cnc.pause.steps[1]  =  obj.steps[1];
      cnc.pause.steps[2]  =  obj.steps[2];
      cnc.pause.status    =  true;
      $scope.comando      =  cnc.pause.steps.toString();
    }
    $scope.cnc.working = false;
  }); 
  
  ipc.on('add-line', (event, data) => { 
    //graficar trabajo. :D
    if($scope.lineTable.length > 10) $scope.lineTable.shift();
    $scope.lineTable.push( line.new( data.line.code, data.line.ejes, undefined, data.line.travel, data.nro));
    if(data.nro && data.line.travel){
      $scope.cnc.file.Progress(data.nro,data.line.travel);
      $('title').text('CNC-ino - '+$scope.cnc.file.line.progress+"% - "+$scope.cnc.file.name);
    }
  });
    
  $scope.start = () => {
    if(!cnc.pause.status){
      $scope.lineTable = [];
      $scope.cnc.time.start = new Date();
      $scope.cnc.time.end = new Date(
        new Date().getMilliseconds() + $scope.cnc.file.line.duration
      );
      ipc.startArd({follow:false, steps:[0,0,0]});
    }else{ // pausa
      $scope.cnc.pause.status = false;
      $scope.cnc.steps = [0,0,0];
      // saber cunato tiempo estuvo parado y sumar
      $scope.cnc.time.end = new Date(
        $scope.cnc.time.end.getMilliseconds() + $scope.cnc.time.pause.getTime()
      );
      //
      $scope.cnc.time.pause = '--:--'
      ipc.startArd({follow : true, steps: cnc.pause.steps });
    }
    $scope.progressBar = 'uk-active';
  }
  
  var data = null, graph = null;
  function drawVisualization(data) {
    if(exceeds_x) notify( 'El modelo se excede en X.', 'warning' );
    if(exceeds_y) notify( 'El modelo se excede en Y.', 'warning' );

    if(data === undefined){
      data = new vis.DataSet();
      data.add({ x:0, y:0, z:0 });
    }
    // specify options
    var options = {
      width:  '660px',
      height: '600px',
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