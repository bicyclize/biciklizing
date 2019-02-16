Hydra.module.register('Superheader', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#superheader',
    element: undefined,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init slider */
      this.superheaderWidth();
    },

    superheaderWidth: function() {
      var self = this;
      var bestWidth = $('body').hasClass('view_static') ? $('.static_pages').width() : $('#home').width();

      this.element.width(bestWidth);

      $(window).resize(function() {
        setTimeout(function() {
          var bestWidth = $('body').hasClass('view_static') ? $('.static_pages .page:visible').eq(0).outerWidth(true) : $('#home').width();

          self.element.width(bestWidth);
        }, 200);

      });

    }
  };
});