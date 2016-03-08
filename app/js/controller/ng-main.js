/* global angular */
angular.controller('main',
['ipc','cnc','$scope','lineTable','config','Line',
(ipc,cnc,$scope,lineTable,config,Line) => {

// # Test doc. :START
console.log(ipc.sendSync('synchronous-message', 'ping'));
ipc.on('asynchronous-reply', (event, arg) => {console.log(arg);});
ipc.send('asynchronous-message', 'ping');
// # Test doc. :END
  
  Line.add( Line.new('G01 X23 Y53 Z93 F2333',[32,24,12] ,[32,24,12] ,234 ,4 ) );
    
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  
  ipc.send('arduino');
  ipc.on('arduino-res', (event, ardu) => {
    if(ardu.type!=='') cnc.arduino=false;
    else cnc.arduino=true;
    var l = Line.new(ardu.code);
    l.type = ardu.type;
    Line.add( l );
  });
  
  $scope.setFile = () => {
    var file = ipc.sendSync('open-file'); 
    //dir
    if ( file ){
      console.log(file);
      //$scope.cnc.file.gcode = file.gcode;
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;
    }
  };
  
  $scope.enviarDatos = (cmd) => {
    //cnc.working = true;
    if(ipc.sendArd(cmd)) Line.add( Line.new('Comando manual: '+cmd) );
  }
  $scope.moverOrigen = () => {
    //cnc.working = true;
    if(ipc.sendArd('o') )  Line.add( Line.new('Comando mover al origen.'));
  }
  $scope.pausa = () => { 
    $scope.cnc.time.pause = new Date();
    if(ipc.sendArd('p')) Line.add( Line.new('Orden de parar'));
  }
  $scope.parar = () => {
    if(ipc.sendArd('0,0,0')){
      //Line.add( Line.new('Orden de parar'));
      $scope.cnc.file.line.interpreted = 0;
      $scope.cnc.file.line.progress = 0;
      $scope.cnc.pause.steps[0]=0;
      $scope.cnc.pause.steps[1]=0;
      $scope.cnc.pause.steps[2]=0;
      $scope.cnc.pause.status=false;
    }
  }
  
  
  var stepsmm = 'steps';
  $scope.setmmpass = (valor) => { stepsmm=valor; };
  $scope.inputpasosmm = '200';
  
  $scope.moverManual = (nume,eje,sentido) => {
    var cmd;
    switch (eje) {
      case "X": cmd = sentido+nume+",0,0"     ; break;
      case "Y": cmd = "0,"+sentido+nume+",0"  ; break;
      case "Z": cmd = "0,0,"+sentido+nume     ; break;
      default:  cmd = "0,0,0"                 ; break;
    }
    var l =  Line.codeType(cmd , stepsmm) ;
    if(ipc.sendArd(l.steps.toString())) {
      Line.add(l);
      $scope.comando  =  '';
    }
  }
  
  ipc.on('close-conex', (event,obj) => {
    if(obj.type == 'none' && obj.data[0]==='0' && obj.data[1]==='0' && obj.data[2]==='0'){
      console.log(obj.data.toString(),'-> Emit -->> Terminado <<--');
      Line.add( Line.new('Terminado: '+obj.data) );
    }else if(obj.type != 'none'){//Pause
      console.log(obj.data,'Emit -->> indefinido <<--');
      var l = Line.new('Respuesta: '+obj.data);
      l.type = obj.type;
      Line.add( l );
    }else{
      console.log(obj.data.line,obj.data.steps.toString(),'Emit -->> Pausado <<--');
      Line.add( Line.new('Pausado: '+obj.data.steps) );
      cnc.pause.line      =  obj.data.line ;
      cnc.pause.steps[0]  =  obj.data.steps[0];
      cnc.pause.steps[1]  =  obj.data.steps[1];
      cnc.pause.steps[2]  =  obj.data.steps[2];
      cnc.pause.status    =  true;
      $scope.comando      =  cnc.pause.steps.toString();
    }
    $scope.cnc.working = false;
  }); 
  
  ipc.on('addLineTable',  (event,data) => {
    //var gcode = $scope.cnc.file.gcode;        
    Line.add( Line.new(data.line.code,data.line.ejes,undefined,data.line.travel,data.nro));
    if(data.nro && data.line.travel){
      $scope.cnc.file.Progress(data.nro,data.line.travel);
      $('title').text($scope.cnc.file.line.progress+"% - "+$scope.cnc.file.name);
    }
  });
    
  $scope.start = () => {
    if(cnc.file.line.total !== 0){
      if(!cnc.pause.status){
        $scope.lineTable = [];
      }else{
        $scope.cnc.pause.status = false;
        $scope.cnc.steps = [0,0,0];
        $scope.cnc.time.pause = '--.--'
        $scope.cnc.time.end = new Date(
          $scope.cnc.time.end.getTime() + $scope.cnc.time.pause.getTime()
        );
      }
      $scope.cnc.time.start = new Date();
      $scope.cnc.time.end = new Date(
        $scope.cnc.time.start.getTime() + $scope.cnc.file.line.duration
      );
      ipc.startArd({line:0});
    }else{
      ipc.startArd({
        line:'?',
        steps:cnc.pause.steps[0]+','+cnc.pause.steps[1]+','+cnc.pause.steps[2]
      });
    }
  }
  
}]);