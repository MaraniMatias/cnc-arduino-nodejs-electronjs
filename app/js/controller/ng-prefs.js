/* global angular */
/* global $ */
angular.controller('modalprefs',
[ 'notify','ipc','cnc','$scope','lineTable','config','line',
( notify,ipc,cnc,$scope,lineTable,config,line) => {

  var modal = {
    $: $('.ui.modal').modal({ closable: false }),
    isActive: false,
    show: () => {
      modal.$.modal('show');
      this.isActive = true;
    },
    hide: () => {
      modal.$.modal('hide');
      this.isActive = false;
    }
  };

  ipc.on('show-prefs-res', (event, config) => {
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = config;
  });

  $scope.cancel = () => { modal.hide(); }
  $scope.save = () => {
    modal.hide();
    ipc.send('config-save-send', $scope.configModal);
  }

  ipc.on('config-save-res', (event, config) => {
    if (config.file) { $scope.configModal = config.file; }
    if (config.message) { notify(config.message, config.type); }
    modal.hide();
  });

}]);