/**
 * Creates 'modal' by getting the id of the element and integrates with semantic-ui.
 */
angular.factory('modalFactory', [function () {
  return function (id, clsbl) {
    var modal = {
      $: $('#' + id).modal({ closable: clsbl || false }),
      isActive: false,
      show: function () {
        if (!this.isActive) {
          modal.$.modal('show');
          this.isActive = true;
        }
      },
      hide: function () {
        modal.$.modal('hide');
        this.isActive = false;
      }
    };
    return modal;
  };
}])
;
