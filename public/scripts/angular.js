app.controller('TodoListController',['pUSB','$http','$scope',
function(pUSB,$http,$scope){
  $scope.enviarDatos=function(comando){
    $scope.comando='';
    console.log("comando %s",comando);
    $http({ url: "/comando",method: "POST",
      data: {
            comando : comando
            }
    }).success(function(data, status, headers, config) {
      console.log('success comando',data);
    }).error(function(data, status, headers, config) {
      console.log('error comando',data);
    });
  }
  $scope.moverOrigen=function(){
    $http({ url: "/moverOrigen",method: "POST",data: {}
    }).success(function(data, status, headers, config) {
      console.log('success comando',data);
    }).error(function(data, status, headers, config) {
      console.log('error comando',data);
    });
  }
  $scope.setUSB=function(port){
    $scope.pUSB=port;
    $http({ url: "/conect",method: "POST",
      data: {
            comUSB : port
            }
    }).success(function(data, status, headers, config) {
      console.log('success conect',data);
    }).error(function(data, status, headers, config) {
      console.log('error conect',data);
    });
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