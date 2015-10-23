app.controller('TodoListController',['pUSB','$http','$scope',
function(pUSB,$http,$scope){ $scope.inputpasosmm='200';
  var varpasosmm = 'pasos';$scope.setmmpass=function(valor){varpasosmm=valor;}

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
    $scope.pUSB=port;
    if($scope.pUSB!=''){
    $http({ url: "/conect",method: "POST",
      data: {comUSB : port}
    }).success(function(data, status, headers, config) {
      console.log('success conect',data);
    }).error(function(data, status, headers, config) {
      console.log('error conect',data);
    });
    }else{
      console.log("Select puerto");
    }
  }

  $scope.updateUSB=function(){
    $http.get('/portslist').success(function (data) {
      if(data){
        $scope.port=data;
      }else{
        $scope.port=[];
      }
    });
  }

}]);