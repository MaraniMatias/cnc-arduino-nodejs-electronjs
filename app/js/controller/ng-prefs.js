/* global angular */
/* global $ */
angular.controller('modalprefs',
['notify', 'ipc', '$scope', 'modalFactory',
function (notify, ipc, $scope, modalFactory) {

  var modal = modalFactory('modalprefs');

  ipc.on('show-prefs-general-res', function (event, argConfig) {
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = argConfig;
  });

  $scope.cancel = function () { modal.hide(); }
  $scope.save = function () { ipc.send('config-save-send', $scope.configModal); }

  ipc.on('config-save-res',function (event, config) {
    if (config.file) { $scope.configModal = config.file; }
    if (config.message) { notify(config.message, config.type); }
    modal.hide();
  });

}]);
