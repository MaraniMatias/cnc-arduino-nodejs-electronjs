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
      cnc.arduino=true;
    }else{
      cnc.arduino=false;
    }
    var l = Line.new(ardu.code);
    l.type = ardu.type;
    Line.add( l );
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
    // comprimir y chequear arduin
    ipc.sendSync('send-command',command)
    cnc.working = true;
    Line.add( Line.new('Comando manual: '+command) );
    //upload.comando(command);
  }
  $scope.moverOrigen = () => {
    // comprimir y chequear arduin
    ipc.send('send-command','o')
    cnc.working = true;
    Line.add( Line.new('Comando mover al origen.'));
    //upload.comando('o');
  }  
  $scope.pausa = () => { 
    // comprimir y chequear arduin
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
    
    // comprimir y chequear arduin
    ipc.send('send-command',l.steps.toString());
    cnc.working = true;
    Line.add(l);
    //upload.comando(l.steps.toString());
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
      console.log(obj.data.toString(),'Emit -->> Pausado <<--');
      Line.add( Line.new('Pausado: '+obj.data) );
      cnc.pause.steps[0]=obj.data[0];
      cnc.pause.steps[1]=obj.data[1];
      cnc.pause.steps[2]=obj.data[2];
      cnc.pause.status=true;
    }
    $scope.cnc.working = false;
  }); 
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
  /*ipc.on('addLineTable',  (event,data) => {
    console.log(data); //////////////////
    // add line
    if(data.nro && data.travel){
      $scope.cnc.file.Progress(data.nro,data.travel);
      $('title').text("CNC "+$scope.cnc.file.line.progress+"%");
    }
  });*/
  
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