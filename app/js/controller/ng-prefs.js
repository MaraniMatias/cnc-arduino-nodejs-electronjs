/* global angular */
/* global $ */
/* global vis */
angular.controller('prefs',
[ 'notify','ipc','cnc','$scope','lineTable','config','line',
( notify,ipc,cnc,$scope,lineTable,config,line) => {
'use strict'
  
  ipc.on('show-prefs-res', (event, config) => {
    var modal = UIkit.modal(".modal");
    if( modal.isActive() ){ modal.hide(); }
    else{ modal.show(); }
    
    $scope.configFile = config;
    
    
  });
    
}]);



