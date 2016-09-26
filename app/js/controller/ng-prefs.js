/* global angular */
/* global $ */
angular.controller('modalprefs',
['notify', 'ipc', '$scope', 'config', 'modalFactory',
(notify, ipc, $scope, config, modalFactory) => {

  var modal = modalFactory('modalprefs');
  $scope.configModal = config;

  ipc.on('show-prefs-general-res', (event, argConfig) => {
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = argConfig;
  });

  $scope.cancel = () => { modal.hide(); }
  $scope.save = () => { ipc.send('config-save-send', $scope.configModal); }

  ipc.on('config-save-res', (event, config) => {
    if (config.file) { $scope.configModal = config.file; }
    if (config.message) { notify(config.message, config.type); }
    modal.hide();
  });

}]);