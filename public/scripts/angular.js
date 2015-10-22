app.controller('TodoListController',['pUSB','$http','$scope',
function(pUSB,$http,$scope){

  $scope.setUSB=function(port){
    $scope.pUSB=port;
    console.log(port);
  }

  $scope.updateUSB=function(port){
    $http.get('/portslist').success(function (data) {
      if(data){
        $scope.port=data;
      }else{
        $scope.port=[];
      }
    });
  }

}]);