app.controller('TodoListController',['pUSB','$http','$scope',
function(pUSB,$http,$scope){ $scope.inputpasosmm='200';
  var varpasosmm = 'pasos';$scope.setmmpass=function(valor){varpasosmm=valor;}
$scope.SelecArduino="Selec Arduino";

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
      console.log("Select puerto");
    }
  }

  $scope.enviarDatos=function(comando){
    if($scope.pUSB!=''){
      $scope.comando='';
      console.log("comando %s",comando);
      $http({ url: "/comando",method: "POST",data: {comando : comando}
      }).success(function(data, status, headers, config) {
        console.log('success comando',data);
      }).error(function(data, status, headers, config) {
        console.log('error comando',data);
      });
    }else{
      console.log("Select puerto");
    }
  }
  $scope.moverOrigen=function(){
    if($scope.pUSB!=''){
      $http({ url: "/moverOrigen",method: "POST",data: {}
      }).success(function(data, status, headers, config) {
        console.log('success comando',data);
      }).error(function(data, status, headers, config) {
        console.log('error comando',data);
      });
    }else{
      console.log("Select puerto");
    }
  }
  $scope.setUSB=function(port){
    $scope.pUSB = port.comName;
    $scope.SelecArduino = port.manufacturer;
    if($scope.pUSB!=''){
    $http({ url: "/conect",method: "POST",
      data: {comUSB : port.comName}
    }).success(function(data, status, headers, config) {
      console.log('success conect',data);
    }).error(function(data, status, headers, config) {
      console.log('error conect',data);
    });
    }else{
      console.log("Select puerto");
    }
  }
  $scope.$on('updateUSB',function(){
    $http.get('/portslist').success(function (data) {
      if(data){
        $scope.port=data;
      }else{
        $scope.port=[];
      }
    });
  });
$scope.$emit('updateUSB');
//######################

//$scope.ejeXposicion = 0.000;
//$scope.ejeYposicion = 0.000;
//$scope.ejeZposicion = 0.000;

}])


.controller('HomeCtrl', ['$scope', 'upload', function ($scope, upload){
  $scope.uploadFile = function(){
    var file = $scope.file;
    console.log(file);
    upload.uploadFile(file).then(function(res){
      console.log(res);
    })
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

.service('upload', ["$http", "$q", function ($http, $q)
{
  this.uploadFile = function(file){
    var deferred = $q.defer();
    var formData = new FormData();
    formData.append("file", file);
    return $http.post("/cargarGCODE", formData, {
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
    return deferred.promise;
  }
}])