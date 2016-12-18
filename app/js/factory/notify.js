/**
 * Displays messages in the status bar.
 */
angular.factory('notify', ['statusBar', function (statusBar) {
  return function (message,type) {
    statusBar.message = message;
    statusBar.type = type; // error success warning none question info
    // tatusBar.time = time || 2300;
  };
}])