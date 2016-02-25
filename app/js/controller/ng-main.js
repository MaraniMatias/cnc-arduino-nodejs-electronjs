/* global angular */
angular.controller('main',
['ipc','cnc','$scope','upload','lineTable','config','Line',
(ipc,cnc,$scope,upload,lineTable,config,Line) => {

// # Test doc. :START
console.log(ipc.sendSync('synchronous-message', 'ping'));
ipc.on('asynchronous-reply', (event, arg) => {console.log(arg);});
ipc.send('asynchronous-message', 'ping');
// # Test doc. :END
  
  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  
  ipc.send('arduino');
  ipc.on('arduino-res', (event, ardu) => {
    if(ardu.type!==''){
      $scope.lineTable.push(ardu);
    }
  });
  
  $scope.setFile = () => {
    var file = ipc.sendSync('open-file'); 
    //data.gcode
    //dir
    if ( file ){
      console.log(file);
      $scope.cnc.file.name = file.name;
      $scope.cnc.file.line.total = file.lines;
      $scope.cnc.file.line.duration = parseInt(file.segTotal);
      $scope.cnc.file.travel = file.travel;
    }
  };
  
  $scope.enviarDatos = (command) => {
    ipc.sendSync('send-command',command)
    cnc.working = true;
    Line.add( Line.new('Comando manual: '+command) );
    //upload.comando(command);
  }
  $scope.moverOrigen = () => {
    ipc.send('send-command','o')
    cnc.working = true;
    Line.add( Line.new('Comando mover al origen.'));
    //upload.comando('o');
  }  
  $scope.pausa = () => { 
    $scope.cnc.time.pause = new Date();
    ipc.send('send-command','p')
    //upload.comando('p');
  }
  var varpasosmm = 'steps';
  $scope.setmmpass = (valor) => { varpasosmm=valor; };
  $scope.inputpasosmm = '200';
  
  $scope.moverManual= (nume,eje,sentido) => {
    var command;
    switch (eje) {
      case "X": command = sentido+nume+",0,0"     ; break;
      case "Y": command = "0,"+sentido+nume+",0"  ; break;
      case "Z": command = "0,0,"+sentido+nume     ; break;
      default:  command = "0,0,0"                 ; break;
    }
    var l =  Line.codeType(command , varpasosmm) ;
    
    ipc.send('send-command',l.steps.toString());
    //cnc.working = true;
    Line.add(l);
    //upload.comando(l.steps.toString());
  }
  
  
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
  /*ipc.on('addLineTable',  (event,data) => {
    console.log(data); //////////////////
    // add line
    if(data.nro && data.travel){
      $scope.cnc.file.Progress(data.nro,data.travel);
      $('title').text("CNC "+$scope.cnc.file.line.progress+"%");
    }
  });*/
  
  
  ipc.on('closeConex', (data) => {
    console.log(data);
    if (data.steps){
      cnc.pause.steps[0]=data.steps[0];
      cnc.pause.steps[1]=data.steps[1];
      cnc.pause.steps[2]=data.steps[2];
      cnc.pause.status=true;
    }
    $scope.lineTable.push(data);
    $scope.cnc.working = false;
  }); 
  
  $scope.parar = () => {
    upload.comando('0,0,0',undefined);
    $scope.cnc.file.line.interpreted = 0;
    $scope.cnc.file.line.progress = 0;
    $scope.cnc.pause.steps[0]=0;
    $scope.cnc.pause.steps[1]=0;
    $scope.cnc.pause.steps[2]=0;
    $scope.cnc.pause.status=false;
  }
  
  $scope.comenzar = function() {

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
      upload.comenzar();
    }else{
      upload.comando('['+cnc.pause.steps[0]+','+cnc.pause.steps[1]+','+cnc.pause.steps[2]+']','steps');
    }
  }
  
}]);