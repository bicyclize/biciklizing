Hydra.module.register('Page', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '.page',
    element: undefined,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init slider */
      this.initSlider();
    },

    initSlider: function() {
      this.element.find('.slider').ui_slider();
    }
  };
});