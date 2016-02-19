angular.controller('main',['ipc','socket','cnc','$scope','upload','lineTable',
(ipc,socket,cnc,$scope,upload,lineTable) => {

// # Test doc. :START
console.log(ipc.sendSync('synchronous-message', 'ping'));
ipc.on('asynchronous-reply', (event, arg) => {
  console.log(arg);
});
ipc.send('asynchronous-message', 'ping');
// # Test doc. :END

  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  
  ipc.send('arduino');
  ipc.on('arduino-res', (event, ardu) => {
    if(ardu.type!==''){$scope.lineTable.push(ardu);}
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
  
  ipc.on('addLineTable',  (event,data) => {
    console.log(data); //////////////////
    if($scope.lineTable.length > 14){ 
      $scope.lineTable.shift();
    }
    $scope.lineTable.push(data);
    if(data.nro && data.travel){
      $scope.cnc.file.Progress(data.nro,data.travel);
      $('title').text("CNC "+$scope.cnc.file.line.progress+"%");
    }
  });
  
  
  $scope.enviarDatos = (comando) => {
    // armar linea enviar
    ipc.sendSync('send-command',{ code:comando ,type: undefined})
    cnc.working = true;

    // addLine

    //upload.comando(comando,undefined);
  }
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  $scope.parar = function(){
    upload.comando('0,0,0',undefined);
    $scope.cnc.file.line.interpreted = 0;
    $scope.cnc.file.line.progress = 0;
    $scope.cnc.pause.steps[0]=0;
    $scope.cnc.pause.steps[1]=0;
    $scope.cnc.pause.steps[2]=0;
    $scope.cnc.pause.status=false;
  }
  
  $scope.pausa = function(){ 
    $scope.cnc.time.pause = new Date();
    upload.comando('p',undefined);
  }
  
  $scope.comenzar = function(){

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
  
  socket.on('closeConex', function (data) {
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
  
  var varpasosmm = 'steps';
  $scope.setmmpass = function(valor){ varpasosmm=valor; };
  $scope.inputpasosmm = '200';
  $scope.moverManual=function(nume,eje,sentido){
    var str;
    switch (eje) {
      case "X": str = sentido+nume+",0,0"; break;
      case "Y": str = "0,"+sentido+nume+",0"; break;
      case "Z": str = "0,0,"+sentido+nume; break;
      default:  str = "0,0,0" ; break;
    }
    upload.comando(str,varpasosmm);
  }


  $scope.moverOrigen = () => {
    upload.comando('o',undefined);
  }
}]);