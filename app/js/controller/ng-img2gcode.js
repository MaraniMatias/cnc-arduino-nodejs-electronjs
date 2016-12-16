/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', '$scope', 'modalFactory',
function (notify, ipc, $scope, modalFactory) {

  var modal = modalFactory('modalConfig');
  /**
   *  Receive the configuration file and show the modal.
   */
  ipc.on('show-prefs-img2gcode-res',function (event, argConfig) {
    if (modal.isActive) { modal.hide(); }
    else { modal.show(); }
    $scope.configModal = argConfig;
  });
  // Button actions
  $scope.cancel = function () { modal.hide(); }
  $scope.save = function () { ipc.send('config-save-send', $scope.configModal); }

}]);
