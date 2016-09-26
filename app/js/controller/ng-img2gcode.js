/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', 'cnc', '$scope', 'config', 'modalFactory',
(notify, ipc, cnc, $scope, config, modalFactory) => {

  var modalConfig = modalFactory('modalConfig');
  //modalConfig.show();

  /*
  $scope.progressBar = 'warning';
  $scope.progressBar = 'active';
  $scope.progressBar = 'error';
  $scope.progressBar = 'success';
  $scope.progressBar = 'indicating';
  */


    ipc.on('show-prefs-i2gc-res', (event, argConfig) => {
      if (modalConfig.isActive) { modalConfig.hide(); }
      else {
        $scope.toolConfig = argConfig.toolConfig;
        modalConfig.show();
      }
    });

  $scope.cancel = () => { modalConfig.hide(); }
  $scope.save = () => {
    modalConfig.hide();
    ipc.send('config-save-send', $scope.configModal);
  }

  ipc.on('config-save-res', (event, config) => {
    if (config.file) { $scope.configModal = config.file; }
    if (config.message) { notify(config.message, config.type); }
    modal.hide();
  });

}]);