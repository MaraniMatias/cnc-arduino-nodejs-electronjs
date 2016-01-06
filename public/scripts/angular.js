/* global angular */
/* global $ */
/* global app */
/* global io */
var app = angular.module('app', []).value('pUSB','').value('alerts', []);
app.controller('main',['addMessage','pUSB','$http','$scope','upload',
function(addMessage,pUSB,$http,$scope,upload){
  $scope.SelecArduino="Selec Arduino";$scope.btnClass="disabled";
  $scope.inputpasosmm='200';
  var varpasosmm = 'pasos';
  $scope.setmmpass=function(valor){varpasosmm=valor;}

  btnDisabled(false,true)
  function btnDisabled(b,v) {
    if(b && v){
      $scope.btnplay   = '';
      $scope.btnpause  = 'disabled';
      $scope.btnstop   = '';
      $scope.btntrash  = 'disabled';
      $scope.btnupdate = 'disabled';
    }else{
      $scope.btnplay   = (v||b)?'disabled':'';
      $scope.btnpause  = !b?'disabled':'';
      $scope.btnstop   = !b?'disabled':'';
      $scope.btnClass  = b?'disabled':'';
      $scope.btntrash  = (v||b)?'disabled':'';
      $scope.btnupdate = !v?'disabled':'';
    }
  }

  $scope.codeArchivo  = {name:'Sin Archivo'};
  $scope.horaInicio   = '--:--';

  function progreso(line) {
    line++;
    $('#codeEjecutado').text(" "+line);
    return (line*100)/$('#codeTotal').text();
  }

  $scope.setFile = function(element) {
    $scope.$apply(function($scope) {
      btnDisabled(false,false);

      $scope.codeArchivo  = element.files[0];
        upload.uploadFile(element.files[0]).then(function(res){
          $('#codeTotal').text(" "+res.data.lineas);
        })
    });
  };

  $scope.moverManual=function(nume,eje,sentido){
    var str = undefined;
    $scope.btnClass="disabled";
    switch (eje) {
      case "X": str= "["+sentido+nume+",0,0]"; break;
      case "Y": str = "[0,"+sentido+nume+",0]"; break;
      case "Z": str = "[0,0,"+sentido+nume+"]"; break;
      default:  str ="[0,0,0]" ; break;
    }

    if($scope.pUSB!==''&&str!==undefined){
      //$http.get('/comando/'+str)
      $http({ url: "/comando",method: "POST",
        data: {
          code : str,
          tipo : varpasosmm
        }
      })
      .success(function(data, status, headers, config) {
        if(data){
          $scope.btnClass="";

        }
      })
      .error(function(data, status, headers, config) {
          addMessage(data.error.message,"Error",4);
          $scope.btnClass="";
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  }

  $scope.enviarDatos=function(comando){
  if(comando != null){
    if($scope.pUSB!=''){
      $scope.btnClass="disabled";
      if(comando!==undefined && comando!="" ){
        $scope.comando='';
        //$http.get('/comando/'+comando)

        $http({ url: "/comando",method: "POST",
          data: {
            code : comando,
            tipo : undefined
          }
        })

        .success(function(data, status, headers, config) {
          if(data){ $scope.btnClass="";}
        })
        .error(function(data, status, headers, config) {
          addMessage(data.error.message,"Error",4);
        });
      }else{
        addMessage("Escriba comando para enviar.","Error",4);
      }
    }else{
      addMessage("Por favor selecione el arduino.","Error",4);
    }
  }
  }

  $scope.moverOrigen=function(){
    if($scope.pUSB!=''){
      $http({ url: "/moverOrigen",method: "POST",data: {}
      }).error(function(data, status, headers, config) {
        addMessage(data.error.message,"Error",4);
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  }
  $scope.setUSB=function(port){
    $scope.pUSB = port.comName;
    $scope.SelecArduino = port.manufacturer;
    if($scope.pUSB!=''){
      $http({ url: "/conect",method: "POST",
        data: {comUSB : port.comName}
      }).success(function(data, status, headers, config) {
        if(data){$scope.btnClass="";}
      })
      .error(function(data, status, headers, config) {
        addMessage(data.error.message,"Error",4);
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  }
  $scope.$on('updateUSB',function(){
    $http.get('/portslist').success(function (data) {
      if(data){
        $scope.port=data.ports;
        if(data.portSele){
          $scope.pUSB = data.portSele.comName;
          $scope.SelecArduino = data.portSele.manufacturer;
          $scope.btnClass="";
          addMessage("Arduino conectado por puerto "+data.portSele.comName,"Arduino Detectado.",1);
        }
      }else{
        $scope.port=[];
      }
    });
  });
  $scope.$emit('updateUSB');

  $scope.parar = function(){
    btnDisabled(false,false);
    //upload.parar();
    $('#codeEjecutado').text(" 0");
    $('#progress').text(" 0%");
    $('#bar').width("0%");
    $('#progressbar').attr("data-percent", 0 );
    $scope.btnClass="";
  }
  $scope.pausa = function(){btnDisabled(false,false);
    $scope.btnClass="";
    //upload.parar();
  }
  $scope.borrar = function(){btnDisabled(false,true);
    //upload.borrar();
    $('#codeTotal').text(" 0");
    $scope.codeArchivo={name:"Sin Archivo"};
  }
  $scope.comenzar = function(){$scope.horaInicio = Date.now();
    btnDisabled(true,false); $('#tablagcode tr').remove();
    upload.comenzar();
  }

  io.emit('connection');
  io.on('lineaGCode', function (data) {
    var n = $("#tablagcode tr").size();
    if(n > 14){$("#tablagcode tr")[n-15].remove();}

    $('#tablagcode').append(
      $('<tr>')
        .append($('<td class="center aligned collapsing">').text(data.nro))
        .append($('<td class="center aligned ">').text( !isNaN(data.ejes[0]) ? Math.round(data.ejes[0]*100) / 100 : '' ))
        .append($('<td class="center aligned ">').text( !isNaN(data.ejes[1]) ? Math.round(data.ejes[1]*100) / 100 : '' ))
        .append($('<td class="center aligned ">').text( !isNaN(data.ejes[2]) ? Math.round(data.ejes[2]*100) / 100 : '' ))
        .append($('<td>').text(data.code))
        .append($('<td>').text(data.pasos[0]))
        .append($('<td>').text(data.pasos[1]))
        .append($('<td>').text(data.pasos[2]))
      );

    if(data.nro){
      var prgrss = progreso(data.nro).toFixed(2);
      $('#progress').text(" "+prgrss+"%");
      $('#bar').width(prgrss+"%");
      $('#progressbar').attr("data-percent", prgrss );
      $('title').text("CNC "+prgrss+"%");
    }
  });

}])

.controller("message",['alerts','$scope',function(alerts,$scope){
  $scope.alerts=alerts;
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
}])

.factory('addMessage', ['alerts',function(alerts) {
  return function(msg,header,type) {
    switch(type){
      case 1: type='info';break;case 2: type='success';break;
      case 3: type='warning';break;case 4: type='negative';break;
      case 5: type='black';break;default:type='';
    }
    alerts.push({type:type,header:header, msg:msg});
  };
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

.service('upload', ["$http", "$q","addMessage", function ($http, $q,addMessage){
  this.comenzar = function(){
    var deferred = $q.defer();
    return $http.get("/comenzar")
    .success(function(res){
      if(!res){
        addMessage("algo salio mal :(","Error",4);
      }else{
        //$scope.btnClass="disabled";
      }
      deferred.resolve(res);
    })
    .error(function(msg, code){deferred.reject(msg);})
    addMessage( deferred.promise,"Error",4);
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
    .success(function(res){deferred.resolve(res);})
    .error(function(msg, code){deferred.reject(msg);})
    addMessage( deferred.promise,"Error",4);
  }
}])
