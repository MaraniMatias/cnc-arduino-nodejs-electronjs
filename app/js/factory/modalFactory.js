angular
  .factory('modalFactory', [() => {
    return (id, clsbl) => {
      let modal = {
        $: $('#' + id).modal({ closable: clsbl || false }),
        isActive: false,
        show: () => {
          modal.$.modal('show');
          this.isActive = true;
        },
        hide: () => {
          modal.$.modal('hide');
          this.isActive = false;
        }
      };
      return modal;
    };
  }])
;