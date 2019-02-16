Hydra.module.register('Prerender', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'prerender': {
        'restart': function (oNotify) {
          this.customInit();
        }
      }
    },

    init: function() {
      /* Start custom init */
      this.customInit();
    },

    customInit: function() {
      /* Apply jquery placeholder */
      $('input, textarea').placeholder();
    }
  };
});