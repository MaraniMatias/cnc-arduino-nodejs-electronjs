/* global angular */
/* global $ */
angular.controller('modalprefs',
['notify', 'ipc', 'cnc', '$scope', 'lineTable', 'config', 'line', 'modalFactory',
(notify, ipc, cnc, $scope, lineTable, config, line, modalFactory) => {

  var modal = modalFactory('modalprefs');

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