/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', 'cnc', '$scope', 'config', 'modalFactory',
(notify, ipc, cnc, $scope, config, modalFactory) => {

  $scope.toolConfig = {
    toolDiameter: 1,
    scaleAxes: 700,
    deepStep: -1,
    whiteZ: 0,
    blackZ: 2,
    sevaZ: 2
  };

  var modalConfig = modalFactory('modalConfig');
  //modalConfig.show();

  /*
  $scope.progressBar = 'warning';
  $scope.progressBar = 'active';
  $scope.progressBar = 'error';
  $scope.progressBar = 'success';
  $scope.progressBar = 'indicating';
  */

  /*
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
  */
}]);