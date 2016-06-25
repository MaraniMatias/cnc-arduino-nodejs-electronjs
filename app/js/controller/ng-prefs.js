/* global angular */
/* global $ */
angular.controller('prefs',
[ 'notify','ipc','cnc','$scope','lineTable','config','line',
( notify,ipc,cnc,$scope,lineTable,config,line) => {

  var modal = { 
    $: $('.ui.modal').modal({closable  : false}),
    isActive:false,
    show:()=>{
      modal.$.modal('show');
      this.isActive=true;
    },
    hide:()=>{
      modal.$.modal('hide');
      this.isActive=false;
    }
  };
  
  ipc.on('show-prefs-res', (event, config) => {
    if( modal.isActive ){  modal.hide();  }
    else{  modal.show();  }
    $scope.configModal = config ;
  });
  
  $scope.save = () => {
    modal.hide();
    ipc.send('config-send',{ file: $scope.configModal  , save: true});
  }
  $scope.cancel = () => { modal.hide(); }
    
  ipc.on('config-res', (event, config) => {
    $scope.configModal = config.file ;
    if(config.message){ notify( config.message ); }
    modal.hide();
  });
    
}]);