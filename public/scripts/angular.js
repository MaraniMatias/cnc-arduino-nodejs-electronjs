/* global angular */
/* global $ */
/* global io */
angular.module('app', [])
.value('cnc',{
  arduino:{
    comName:'',
    manufacturer:'Selec Arduino'
  },
  file:{ 
    name:'Sin Archivo',
    line: {
      total: 0,
      interpreted:0,
      duration:0,
      progress:0
    },
    Progress: function (line) {
      if(line != 0){
        line++;
        this.line.interpreted = line;
        this.line.progress = ((line*100)/this.line.total).toFixed(2);
      }
    }
  },
  time:{
    start:'--:--',
    end:'--:--'
  }
})
.value('alerts', [])

.controller('main',['cnc','addMessage','$http','$scope','upload',
function(cnc,addMessage,$http,$scope,upload){
  $scope.cnc = cnc;
  
  $scope.setFile = function(element) {
    $scope.$apply(function($scope) {
      //btnDisabled(false,false);//**************
      upload.uploadFile(element.files[0]).then(function(res){
        $scope.cnc.file.name = element.files[0].name;
        $scope.cnc.file.line.total = res.data.lineas;
        $scope.cnc.file.line.duration = parseInt(res.data.segTotal);
      })
    });
  };
  
  $scope.setArduino = function(port){
    $scope.cnc.arduino = port;
    if($scope.cnc.arduino.comName!=''){
      $http({ url: "/conect",method: "POST",
        data: {
            comUSB : port.comName
          }
      }).success(function(data, status, headers, config) {
        if(data){
          //$scope.btnClass="";//************
        }
      })
      .error(function(data, status, headers, config) {
        addMessage(data.error.message,"Error",4);
      });
    }else{
      addMessage("Por favor selecione el arduino","Error",4);
    }
  };
  
  $scope.$on('updateArduinoList',function(){
    $http.get('/portslist').success(function (data) {
      if(data){
        $scope.port=data.ports;
        if(data.portSele){
          $scope.cnc.arduino = data.portSele;
          //$scope.btnClass="";//********
          addMessage("Arduino conectado por puerto "+data.portSele.comName,"Arduino Detectado. MOSTRAR EN TABLA",1);//*****
        }
      }else{
        $scope.port=[];
      }
    });
  });
  $scope.$emit('updateArduinoList');
  
  $scope.parar = function(){
    //btnDisabled(false,false);
    $scope.cnc.file.line.interpreted = 0;
    $scope.cnc.file.line.progress = 0;
    //upload.parar();
  }
  
  $scope.pausa = function(){
    //btnDisabled(false,false);
    
    //upload.pausa();
  }
  $scope.borrar = function(){
    //btnDisabled(false,true);
    $scope.cnc.file.line.total = 0;
    $scope.cnc.file.line.interpreted = 0;
    $scope.cnc.file.line.duration = 0;
    $scope.cnc.file.line.progress = 0;
    $scope.cnc.file = { name:'Sin Archivo'};
    //upload.borrar();   
  }
  
  $scope.comenzar = function(){
    $scope.cnc.time.start = new Date();
    var elapsed = $scope.cnc.time.start.getTime() + $scope.cnc.file.line.duration;
    $scope.cnc.time.end = new Date(elapsed);
    
    //btnDisabled(true,false); 
    $('#tablagcode tr').remove();//********************
    upload.comenzar();
  }
  
//###################################
  
  //$scope.btnClass="disabled";
  $scope.inputpasosmm='200';
  
  var varpasosmm = 'pasos';
  $scope.setmmpass = function(valor){ varpasosmm=valor; };
  
  
  //btnDisabled(false,true)
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



  $scope.moverManual=function(nume,eje,sentido){
    var str = undefined;
    switch (eje) {
      case "X": str = "["+sentido+nume+",0,0]"; break;
      case "Y": str = "[0,"+sentido+nume+",0]"; break;
      case "Z": str = "[0,0,"+sentido+nume+"]"; break;
      default:  str = "[0,0,0]" ; break;
    }

    if($scope.pUSB!=='' && str!==undefined){
      $http({ url: "/comando",method: "POST",
        data: {
          code : str,
          tipo : varpasosmm
        }
      })
      .success(function(data, status, headers, config) {
        //$('#controlManual button').addClass("disabled");
        $scope.btnClass="disabled";
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
      $scope.btnClass="loading";
      if(comando!==undefined && comando!="" ){
        $scope.comando='';
        $http({ url: "/comando",method: "POST",
          data: {
            code : comando,
            tipo : undefined
          }
        })
        .success(function(data, status, headers, config) {
          //$('#controlManual button').addClass("disabled");
          //$scope.btnClass="disabled";
        })
        .error(function(data, status, headers, config) {
          addMessage(data.error.message,"Error",4);
        });
      }else{
        addMessage("Escriba comando para enviar.","Error",4);
      }
    }else{
      //$scope.btnClass="disabled";
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


  //io.emit('connection');
  
  io.on('closeConex', function (data) {
    if(data.close){
      //$('#controlManual button').removeClass("disabled");
      $('#controlManual button').removeClass("disabled");
      //$scope.btnClass="";
    }else{
      $('#controlManual button').addClass("disabled");
      //$scope.btnClass="disabled";
    }
  });
  
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
      $scope.cnc.file.Progress(data.nro);
      $('title').text("CNC "+$scope.cnc.file.line.progress+"%");
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
  /*
  this.parar = function(){
    return  $http({ url: "/comando",method: "POST",
      data: {
        code : 'p',
        tipo : undefined
      }
    })
    .success(function(data, status, headers, config) {
      $('#controlManual button').removeClass("disabled");
    })
    .error(function(data, status, headers, config) {
      addMessage(data.error.message,"Error",4);
    });
  }
  */
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
