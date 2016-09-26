/* global angular */
/* global $ */
angular.controller('modalProgress',
['notify', 'ipc', '$scope', 'config', 'modalFactory',
(notify, ipc, $scope, config, modalFactory) => {
  var modalProgress = modalFactory('modalProgress');

  $scope.toolConfig = {
    toolDiameter: 1,
    scaleAxes: 700,
    deepStep: -1,
    whiteZ: 0,
    blackZ: 2,
    sevaZ: 2
  };

  $scope.imgName = 'Nada :(';
  $scope.progressBar = {
    class: 'active',
    imgName:'imgName',
    info: 'Loading..',
    perc: 0
  };

  ipc.on('open-file-tick', (event, data) => {
    if (!data.end) {
      modalProgress.show();
      $scope.progressBar = {
        imgName: data.imgName,
        info: data.info,
        perc: data.perc
      };
    } else {
      modalProgress.hide();
    }
    //console.log(data.perc,data.ejes);
  })


  /*
  ipc.on('show-modalImg2gcode', (event, arg) => {
    if (!modalProgress.isActive) { modalProgress.show(); }
    if (arg.end) { modalProgress.hide(); }
    $scope.progressBar = {
      class: 'active',
      imgName:'imgName',
      info: 'Loading..',
      perc: arg.perc
    };
  });
  */

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