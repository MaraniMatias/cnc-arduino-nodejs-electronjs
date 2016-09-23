/* global angular */
/* global $ */
angular.controller('modalImg2gcode',
['notify', 'ipc', 'cnc', '$scope', 'config',
(notify, ipc, cnc, $scope, config) => {
/*
  var modalProgress = {
    $: $('#modalProgress').modal({ closable: false }),
    isActive: false,
    show: () => {
      modalProgress.$.modal('show');
      this.isActive = true;
    },
    hide: () => {
      modalProgress.$.modal('hide');
      this.isActive = false;
    }
  };
  modalProgress.show();
*/
  var modalConfig = {
    $: $('#modalConfig').modal({ closable: false }),
    isActive: false,
    show: () => {
      modalConfig.$.modal('show');
      this.isActive = true;
    },
    hide: () => {
      modalConfig.$.modal('hide');
      this.isActive = false;
    }
  };
  modalConfig.show();
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