/* global angular */
/* global $ */
angular.controller('modalprefs',
['notify', 'ipc', '$scope', 'modalFactory',
function (notify, ipc, $scope, modalFactory) {

  var modal = modalFactory('modalprefs');
  /**
   *  Receive the configuration file and show the modal.
   */
  ipc.on('show-prefs-general-res', function (event, argConfig) {
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = argConfig;
  });
  // Button actions
  $scope.cancel = function () { modal.hide(); }
  $scope.save = function () { ipc.send('config-save-send', $scope.configModal); }
  /**
   * 'Config-save-send' response.
   */
  ipc.on('config-save-res', function (event, config) {
    if (config.file) { $scope.configModal = config.file; }
    if (config.message) { notify(config.message, config.type); }
    modal.hide();
  });

}]);
