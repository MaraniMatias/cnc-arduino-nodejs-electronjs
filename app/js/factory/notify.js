/**
 * Displays messages in the status bar.
 */
angular.factory('notify', ['statusBar', function (statusBar) {
  return function (message,type) {
    statusBar.message = message;
    statusBar.type = type;
    //tatusBar.time = time?time:1000;
  };
}])