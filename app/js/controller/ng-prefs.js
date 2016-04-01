/* global angular */
/* global $ */
/* global vis */
angular.controller('prefs',
[ 'notify','ipc','cnc','$scope','lineTable','config','line',
( notify,ipc,cnc,$scope,lineTable,config,line) => {
'use strict'
  function clone( obj ) {
    if ( obj === null || typeof obj  !== 'object' )  return obj;
    var temp = obj.constructor();
    for ( var key in obj ) {
      temp[ key ] = clone( obj[ key ] );
    }
    return temp;
  }
  var motory = {};
  var modal = UIkit.modal(".modal");
  
  ipc.on('show-prefs-res', (event, config) => {
    if( modal.isActive() ){ modal.hide(); }
    else{ modal.show(); }
    $scope.configModal = config;
    
    $scope.iqualx = true;
    motory = clone(config.motor.y);
    $scope.configModal.motor.y = config.motor.x ;
  });
  
  $scope.iqualX = () => {
    $scope.configModal.motor.y = clone( ($scope.iqualx) ? $scope.configModal.motor.x : motory );
    
  }
  $scope.save = () => {
    ipc.send('config-send',{ file: $scope.configModal  , save: true});
  }
  $scope.cancel = () => {
    ipc.send('config-send',{ save: false});
  }
    
  ipc.on('config-res', (event, config) => {
    if(config.message) notify( config.message );
    $scope.configModal = config.file;
    if( modal.isActive() ){ modal.hide(); }
    else{ modal.show(); }
  });
    
}]);



