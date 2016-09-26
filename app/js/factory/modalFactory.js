angular
  .factory('modalFactory', [() => {
    return (id, clsbl) => {
      let modal = {
        $: $('#' + id).modal({ closable: clsbl || false }),
        isActive: false,
        show: () => {
          if (!this.isActive) {
            modal.$.modal('show');
            this.isActive = true;
          }
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