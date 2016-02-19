/* global electron */
/* global angular */
/* global $ */
/* global io */
angular.module('app', [])
.value('cnc',{
  working:false,
  pause:{
    status: false,
    steps: [0,0,0]
  },
  file:{
    name:'Sin Archivo',
    line: {
      total : 0,
      interpreted : 0,
      duration : 0,
      progress : 0
    },
    travel:0,
    Progress:  (nro,trvl) => {
      nro++;
      this.line.interpreted = nro;
      this.line.progress = ((trvl*100)/this.travel).toFixed(2);
    }
  },
  time:{
    pause:'--:--',
    start:'--:--',
    end:'--:--'
  }
})
.value('lineTable', [])

.controller('main',['ipc','socket','cnc','$scope','upload','lineTable',
(ipc,socket,cnc,$scope,upload,lineTable) => {

// # Test doc. :START
console.log(ipc.sendSync('synchronous-message', 'ping'));
ipc.on('asynchronous-reply', (event, arg) => {console.log(arg); });
ipc.send('asynchronous-message', 'ping');
// # Test doc. :END

  $scope.cnc = cnc;
  $scope.lineTable = lineTable;
  
  ipc.send('arduino');
  ipc.on('arduino-res', (event, ardu) => {
    if(ardu.type!==''){$scope.lineTable.push(ardu);}
  });
  //var ardu = ipc.sendSync('arduino','');
  //if(ardu.type!==''){$scope.lineTable.push(ardu);}
  
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
    if (data.steps!==''){
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

  $scope.enviarDatos = (comando) => {
    ipc.send('send-command',{ code:comando ,type: undefined})
    //upload.comando(comando,undefined);
  }
  $scope.moverOrigen = () => {
    upload.comando('o',undefined);
  }
}])
.service('upload', ['ipc','cnc',"$http", "$q", (ipc,cnc,$http, $q) => { 
  this.comando = (code,type) => {
    if(code !== null){
      if( ipc.sendSync('send-command',{ code , type}) ){
        cnc.working = true;
        cnc.file.line.interpreted = 0;
      }else{
        // mensaje de error
      }
    }
  }
  
  this.comenzar = function(){
    var deferred = $q.defer();
    return $http.post("/comenzar", {
        nro   : cnc.file.line.interpreted,
        steps : cnc.pause.steps[0]+','+cnc.pause.steps[1]+','+cnc.pause.steps[2]
    })
    .success(function(res){
      if(!res){
        //addLineMessage("algo salio mal :(",4);
      }else{
        cnc.working = true;
        cnc.file.line.interpreted = 0;
      }
      deferred.resolve(res);
    })
    .error(function(msg, code){
      deferred.reject(msg);
    })
    //addLineMessage(deferred.promise,4);
  }
}])
/*
.factory('addLineMessage', ['lineTable', (lineTable) => {
  return (msg,type) => {
    switch(type){
      case 1: type='positive'; break;
      case 2: type='active'; break;
      case 3: type='warning';break;
      case 4: type='negative';break;
      case 5: type='disabled';break;
      default:type='';
    }
    lineTable.push({nro:'',ejes:[],type,code:msg,steps:[]});
  };
}])*/
.factory('socket',  ($rootScope) => {
  var ipcRenderer = electron.ipcRenderer;
  return {
    on:  (eventName, callback) => {
      ipcRenderer.on(eventName, (event, arg) => {//
        callback(event,arg);        
        $rootScope.$apply();
      });// on
    },
    emit:  (eventName, data, callback) => {
      ipcRenderer.send(eventName, data, () => {
        var args = arguments;
        $rootScope.$apply( () => {
          if (callback) {
            callback.apply(ipcRenderer, args);
          }
        });
      })
    }
  }// return
})/*
.factory('addMessage', ['ipc',(ipc) =>  {
  return (msg,title,header,type) => {
    switch(type){
      case 1: type='info';break;
      case 2: type='error';break;
      case 3: type='warning';break;
      case 4: type='question';break;
      case 5: type='none';break;
      default:type='none';
    }
    ipc.send('message', { type,title,header,msg });
  };
}])*/
.factory('ipc',  ($rootScope) => {
  const ipcRenderer = electron.ipcRenderer;
  return {
    on:  (eventName, callback) => {
      ipcRenderer.on(eventName, (event, arg) => {
        callback(event,arg);        
        $rootScope.$apply();
      });
    },
    send:  (eventName, data) => {
      ipcRenderer.send(eventName, data );
    },
    sendSync: (eventName, data) => {
      return ipcRenderer.sendSync (eventName, data );
    }
  }// return
})