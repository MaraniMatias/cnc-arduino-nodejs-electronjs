app.controller('TodoListController',['puertoUSB','$http','$scope',
function(puertoUSB,$http,$scope){

$scope.setUSB=function(data){
  $scope.puertoUSB=data;
}


  $http.get('/portslist').success(function (data) {
    //if(angular.isArray(data)){
      $scope.port=data;
    //}else{
    //  $scope.port="nada"
    //}
  });


}]);