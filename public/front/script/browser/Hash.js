Hydra.module.register('Hash', function(Bus, Module, ErrorHandler, Api) {
  return {

    referer: [],

    events: {
      'hash': {
        'change': function(oNotify) {
          window.historyNavigation = false;

          setTimeout(function() {
            window.historyNavigation = true;
          }, 400)

          window.location.hash = '#/' + oNotify.hash;
        }
      }
    },

    init: function() {
      /* Init routes */
      this.initRoutes();

      this.referer = [];

      /* Listen to the defined routes */
      Path.listen();
    },

    /* Routes */
    initRoutes: function() {
      var self = this;
      var firstLoad = true;

      Path.map('#/:hash').to(function() {
        var hash = this.params['hash'] || '';

        self.referer.push(window.location.hash.substring(2));

        /* Preorder */
        if (hash == 'preorder') {
          var referer = self.referer[self.referer.length - 2];

          Bus.publish('Nav', 'showPreorder', {referer: referer});
        }

        /* Normal pages */
        else {
          if (window.historyNavigation) {
            Bus.publish('Nav', 'showMainPage', {page: hash, firstLoad: true});
          }

        }

        firstLoad = false;

      });

      /* Static pages */
      Path.map('#/static/:page').to(function() {
        var page = this.params['page'] || '';

        self.referer.push(window.location.hash.substring(2));

        Bus.publish('Nav', 'showStatic', {page: page});
      });

    }

  };
});