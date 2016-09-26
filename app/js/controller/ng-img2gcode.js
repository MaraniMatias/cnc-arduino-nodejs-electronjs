/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', '$scope', 'config', 'modalFactory',
(notify, ipc, $scope, config, modalFactory) => {

  var modalProgress = modalFactory('modalProgress');
  var modal = modalFactory('modalConfig');
  $scope.configModal = config;

  ipc.on('show-prefs-img2gcode-res', (event, argConfig) => {
    modalProgress.hide();
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = argConfig;
  });

  $scope.cancel = () => { modal.hide(); }
  $scope.save = () => { ipc.send('config-save-send', $scope.configModal); }

}]);