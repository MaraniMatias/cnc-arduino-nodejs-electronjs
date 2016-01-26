/* global angular */
/* global $ */
/* global io */
angular.module('app', [])
.value('cnc',{
  working:false,
  /*arduino:{
    comName:'',
    manufacturer:'Selec Arduino'
  },*/
  file:{ 
    name:'Sin Archivo',
    line: {
      total : 0,
      interpreted : 0,
      duration : 0,
      progress : 0
    },
    travel:0,
    Progress: function (nro,trvl) {
      nro++;
      this.line.interpreted = nro;
      //this.line.progress = ((nro*100)/this.line.total).toFixed(2);
      this.line.progress = ((trvl*100)/this.travel).toFixed(2);
    }
  },
  time:{
    start:'--:--',
    end:'--:--'
  }
})
.value('tableLine', [])

.controller('main',['socket','cnc','addMessage','$http','$scope','upload','tableLine',
function(socket,cnc,addMessage,$http,$scope,upload,tableLine){
  $scope.cnc = cnc;
  $scope.tableLine = tableLine;
  socket.emit('connection');
  
  $scope.setFile = function(element) {
    $scope.$apply(function($scope) {
      upload.uploadFile(element.files[0]).then(function(res){
        $scope.cnc.file.name = element.files[0].name;
        $scope.cnc.file.line.total = res.data.lineas;
        $scope.cnc.file.line.duration = parseInt(res.data.segTotal);
        $scope.cnc.file.travel = res.data.travel;
      })
    });
  };

  $scope.parar = function(){
    upload.comando('[0,0,0]',undefined);
    $scope.cnc.file.line.interpreted = 0;
    $scope.cnc.file.line.progress = 0;
    $scope.cnc.file.travel = 0;
  }
  
  $scope.pausa = function(){   
    //upload.pausa();
    upload.comando('0,0,0',undefined);
  }
  
  $scope.comenzar = function(){
    $scope.tableLine = [];
    $scope.cnc.time.start = new Date();
    var elapsed = $scope.cnc.time.start.getTime() + $scope.cnc.file.line.duration;
    $scope.cnc.time.end = new Date(elapsed);
    upload.comenzar();
  }
  
  socket.on('lineaGCode', function (data) {
    if($scope.tableLine.length > 14){ 
      $scope.tableLine.shift 
    }
    $scope.tableLine.push(data);
    if(data.nro && data.travel){
      $scope.cnc.file.Progress(data.nro,data.travel);
      $('title').text("CNC "+$scope.cnc.file.line.progress+"%");
    }
  });
  socket.on('closeConex', function (data) {
    $scope.cnc.working = data.close? true:false;
  }); 
  
  var varpasosmm = 'steps';
  $scope.setmmpass = function(valor){ varpasosmm=valor; };
  $scope.inputpasosmm = '200';
  $scope.moverManual=function(nume,eje,sentido){
    var str = undefined;
    switch (eje) {
      case "X": str = "["+sentido+nume+",0,0]"; break;
      case "Y": str = "[0,"+sentido+nume+",0]"; break;
      case "Z": str = "[0,0,"+sentido+nume+"]"; break;
      default:  str = "[0,0,0]" ; break;
    }
    upload.comando(str,varpasosmm);
  }

  $scope.enviarDatos=function(comando){
    upload.comando(comando,undefined);
  }

  $scope.moverOrigen=function(){
    upload.comando('o',undefined);
  }

}])
.directive('uploaderModel', ["$parse", function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, iElement, iAttrs){
      iElement.on("change", function(e){
        $parse(iAttrs.uploaderModel).assign(scope, iElement[0].files[0]);
      });
    }
  };
}])
.service('upload', ['cnc',"$http", "$q","addMessage", function (cnc,$http, $q,addMessage){ 
  this.comando = function(cmd,type){
    if(cmd != null /*&& cnc.arduino.comName!=''*/ && !cnc.working){
    return  $http({ url: "/comando",method: "POST",
      data: {
        code : cmd,
        tipo : type
      }
    })
    .success(function(data, status, headers, config) {
      if(data){cnc.working = true;}      
    })
    .error(function(data, status, headers, config) {
      addMessage(data.error.message,4);
    });
    }
  }
  
  this.comenzar = function(){
    var deferred = $q.defer();
    return $http.get("/comenzar")
    .success(function(res){
      if(!res){
        addMessage("algo salio mal :(",4);
      }else{
        cnc.working = true;
        cnc.file.line.interpreted = 0;
      }
      deferred.resolve(res);
    })
    .error(function(msg, code){
      deferred.reject(msg);
    })
    addMessage(deferred.promise,4);
  }
  this.uploadFile = function(file){
    var deferred = $q.defer();
    var formData = new FormData();
    formData.append("file", file);
    return $http.post("/cargar", formData, {
      headers: {
        "Content-type": undefined
      },
      transformRequest: angular.identity
    })
    .success(function(res){
      deferred.resolve(res);
    })
    .error(function(msg, code){
      deferred.reject(msg);
    })
    addMessage(deferred.promise,4);
  }
}])
.factory('addMessage', ['tableLine',function(tableLine) {
  return function(msg,type) {
    switch(type){
      case 1: type='positive'; break;
      case 2: type='active'; break;
      case 3: type='warning';break;
      case 4: type='negative';break;
      case 5: type='disabled';break;
      default:type='';
    }
    tableLine.push({nro:'',ejes:[],type:type,code:msg,steps:[]});
  };
}])
.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
})