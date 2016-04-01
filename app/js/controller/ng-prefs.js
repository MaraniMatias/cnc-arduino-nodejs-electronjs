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
    $scope.configModal = config;
  });
  
  $scope.save = () =>{
    ipc.send('config-send',{ file: $scope.configModal, save: true});
  }
  $scope.cancel = () =>{
    ipc.send('config-send',{ save: false});
  }
    
  ipc.on('config-res', (event, config) => {
    if(config.message) notify( config.message );
    $scope.configModal = config.file;
    var modal = UIkit.modal(".modal");
    if( modal.isActive() ){ modal.hide(); }
    else{ modal.show(); }
  });
    
}]);



