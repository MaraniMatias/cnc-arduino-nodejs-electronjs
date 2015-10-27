app.controller('main',['addMessage','pUSB','$http','$scope','upload',
function(addMessage,pUSB,$http,$scope,upload){
  $scope.SelecArduino="Selec Arduino";
  $scope.inputpasosmm='200';
  var varpasosmm = 'pasos';
  $scope.setmmpass=function(valor){varpasosmm=valor;}

  btnDisabled(false,true)
  function btnDisabled(b,v) {
    if(true==b && true==v){
      $scope.btnplay   = '';
      $scope.btnpause  = 'disabled';
      $scope.btnstop   = '';
      $scope.btntrash  = 'disabled';
      $scope.btnupdate = 'disabled';
    }else{
      $scope.btnplay   = (v||b)?'disabled':'';
      $scope.btnpause  = !b?'disabled':'';
      $scope.btnstop   = !b?'disabled':'';
      $scope.btntrash  = (v||b)?'disabled':'';
      $scope.btnupdate = !v?'disabled':'';
    }
  }

  $scope.codeArchivo  = {name:'Sin Archivo'};
  $scope.horaInicio   = '--:--';
  $scope.codeTotal    = 0;
  $scope.codeEjecutado     = 0;

  function progreso(line) {
    $scope.codeEjecutado = line+1;
    return ((line+1)*100)/$scope.codeTotal;
  }

  $scope.setFile = function(element) {
    $scope.$apply(function($scope) {
      btnDisabled(false,false)
      $scope.codeArchivo  = element.files[0];
        upload.uploadFile(element.files[0]).then(function(res){
          $scope.codeTotal  = res.data.lineas;
        })
    });
  };

  $scope.moverManual=function(nume,eje,sentido){
    var str = undefined;
    switch (eje) {
      case "X": str= "["+sentido+nume+",0,0]"; break;
      case "Y": str = "[0,"+sentido+nume+",0]"; break;
      case "Z": str = "[0,0,"+sentido+nume+"]"; break;
      default:  str ="[0,0,0]" ; break;
    }
    if($scope.pUSB!=''){
      $http({ url: "/comando",method: "POST",data: {comando : str}
      }).success(function(data, status, headers, config) {
        console.log('success comando',data);
      }).error(function(data, status, headers, config) {
        console.log('error comando',data);
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  }

  $scope.enviarDatos=function(comando){
    if($scope.pUSB!=''){
      if(comando!==undefined && comando!="" ){
        $scope.comando='';
        $http({ url: "/comando",method: "POST",data: {comando : comando}
        }).error(function(data, status, headers, config) {
          addMessage(data.error.message,"Error",4);
        });
      }else{
        addMessage("Escriba comando para enviar.","Error",4);
      }
    }else{
      addMessage("Por favor selecione el arduino.","Error",4);
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
      }).error(function(data, status, headers, config) {
        addMessage(data.error.message,"Error",4);
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  }
  $scope.$on('updateUSB',function(){
    $http.get('/portslist').success(function (data) {
      if(data){$scope.port=data;}else{$scope.port=[];}
    });
  });
  $scope.$emit('updateUSB');

  $scope.parar = function(){btnDisabled(false,false)
    //upload.parar();
  }
  $scope.pausa = function(){btnDisabled(false,false);
    //upload.parar();
  }
  $scope.borrar = function(){btnDisabled(false,true);
    //upload.borrar();
  }
  $scope.comenzar = function(){$scope.horaInicio = Date.now();
    btnDisabled(true,false); $('#tablagcode tr').remove();
    upload.comenzar();
  }

  io.emit('connection');
  io.on('lineaGCode', function (data) {
    $('#tablagcode').append(
      $('<tr>')
        .append($('<td>').text(data.nro))
        .append($('<td>').text(data.ejes[0]))
        .append($('<td>').text(data.ejes[1]))
        .append($('<td>').text(data.ejes[2]))
        .append($('<td>').text(data.code))
      );
    if(data.nro){
      var prgrss = progreso(data.nro).toFixed(2);
      $('#progress').text(" "+prgrss+"%");
      $('#bar').width(prgrss+"%");
      $('#progressbar').attr("data-percent", prgrss );
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

.service('upload', ["$http", "$q", function ($http, $q){
  this.comenzar = function(){
    var deferred = $q.defer();
    return $http.get("/comenzar")
    .success(function(res){deferred.resolve(res);})
    .error(function(msg, code){deferred.reject(msg);})
    return deferred.promise;
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
    return deferred.promise;
  }
}])