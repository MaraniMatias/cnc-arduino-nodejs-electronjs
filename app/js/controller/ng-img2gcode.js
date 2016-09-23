/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', 'cnc', '$scope', 'config', 'modalFactory',
(notify, ipc, cnc, $scope, config, modalFactory) => {

  var modalConfig = modalFactory('modalConfig', false);
  modalConfig.show();
  var modalProgress = modalFactory('modalProgress', true);
  modalProgress.show();

  /*
    ipc.on('show-prefs-res', (event, config) => {
      if (modal.isActive) { modal.hide(); }
      else { modal.show(); }
      $scope.configModal = config;
    });
  */
  $scope.cancel = () => { modal.hide(); }
  $scope.save = () => {
    modal.hide();
    //ipc.send('config-save-send', $scope.configModal);
  }
  /*
    ipc.on('config-save-res', (event, config) => {
      if (config.file) { $scope.configModal = config.file; }
      if (config.message) { notify(config.message, config.type); }
      modal.hide();
    });
  */
}]);