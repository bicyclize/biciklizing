(function($) {

  $.widget("ui.ui_slider", {
    options: {
    },

    $list: undefined,
    $slides: undefined,
    currentSlide: 0,
    defaultTimeout: 8000,
    mainInterval: undefined,
    progressInterval: undefined,
    asc: true,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.ui_slider.instances.push(this.element);

      /* Prerender slides to prepare clases and vars */
      this._prerenderSlides();

      /* Get config */
      this.options.automatic = (this.element.attr('data-behaviour') == 'automatic');
      this.options.stopOnHover = (this.element.attr('data-stop-hover') == true);
      this.options.timeOut = parseInt(this.element.attr('data-timeout')) || this.defaultTimeout;
      this.options.activeElements = this.$slides.filter('.active').length;
      this.options.addControls = (this.$slides.length > this.options.activeElements);

      /* Add arrows if necessary */
      if (this.options.addControls) {
        this._addArrows();
        this._addPaginators();
        this._addTimer();
      }

      /* Bind start and stop events */
      this._bindStartStop();

      /* Set slider type */
      if (this.$slides.length > 1) {
        this.element.addClass('multiple');
      }

      /* Start slider if it's automatic */
      if (this.options.automatic && this.$slides.length > 1) {
        this._makeItAutomatic();

        /* Move progress bar if exists */
        if (this.options.addControls) {
          this._startProgressBar();
        }

        if (this.options.stopOnHover) {
          this._controlHover();
        }
      }
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.ui_slider.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.ui_slider.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.ui_slider.instances, function(el) {
        return el !== element;
      });
    },

    /* Prerender slides */

    _prerenderSlides: function() {

      /* Get references */
      this.$list = this.element.find('.slides > ul');
      this.$slides = this.element.find('.slides > ul > li');

      /* If there aren't any active slide, set it the first one */
      if (this.element.find('.slides .active').length == 0) this.element.find('.slides > ul > li').eq(0).addClass('active');

      /* Assign a number to each slide, in order to keep their track */
      this.$slides.each(function(i) {
        $(this).attr('data-slide-id', i);
      });

    },

    /* Add controls */

    _addArrows: function() {
      /* Append arrows */
      this.element.append('<div class="arrows"><div class="prev"><a href="#"><span>Prev</span></a></div><div class="next"><a href="#"><span>Next</span></a></div></div>');

      /* Arrow events */
      this._listenArrows();
    },

    _addPaginators: function() {
      /* Calc pages number */
      var pages = Math.ceil(this.$slides.length / this.options.activeElements);

      /* Prepare paginator */
      var $paginator = $('<div class="paginator"></div>');
      $paginator.append('<ul data-stories-per-page="' + this.options.activeElements + '" data-stories-per-row="' + this.$slides.length + '"></ul>');

      for (n = 0; n < pages; n++) {
        $li = $('<li data-page="' + n + '"><a href="#"><span>' + n +  '</span></a></li>');
        $paginator.find('ul').append($li);
      }

      $paginator.find('li').eq(0).addClass('active');

      /* Append paginator */
      this.element.append($paginator);

      /* Listen dots */
      this._listenDots();
    },

    _addTimer: function() {
      var timer = '<div class="timer"><ul><li><a href="#" class="pause"><span>Pause</span></a></li><li><a href="#" class="play"><span>Play</span></a></li></div>';

      /* Append paginator */
      this.element.append(timer);

      /* Listen play/pause */
      this._listenPlayPause();
    },

    _listenArrows: function() {

      this._on(this.element, {
        'click .arrows a': function(event) {
          event.preventDefault();

          /* Internal vars */
          var $link = $(event.currentTarget);
          var nextArrow = $link.closest('div').hasClass('next');
          var slide = this.currentSlide;

          if (nextArrow) {
            slide++;

            /* Next limit */
            if (slide === this.$slides.length) slide = 0;
          }
          else {
            slide--;

            /* Prev limit */
            if (slide < 0) slide = this.$slides.length - 1;
          }

          /* Go to the new slide */
          this._goToSlide(slide, true);
        }
      });

    },

    _listenDots: function() {
      this._on(this.element, {
        'click .paginator a': function(event) {
          event.preventDefault();

          /* Internal vars */
          var $link = $(event.currentTarget);
          var slide = parseInt($link.closest('li').attr('data-page'));

          /* Restart interval */
          var restartInterval = !this.element.find('.timer').hasClass('paused');

          /* Go to the new slide */
          this._goToSlide(slide, restartInterval);
        }
      });
    },

    _listenPlayPause: function() {
      this._on(this.element, {
        'click .timer a.pause': function(event) {
          event.preventDefault();

          /* Stop slider */
          this._stopSlider();
        },
        'click .timer a.play': function(event) {
          event.preventDefault();

          /* Restart the slider */
          this._playSlider();
        }
      });
    },

    _startProgressBar: function() {
      var timer = this.options.timeOut;
      var stepsEveryMs = 100;
      var stepsDrawn = 1;
      var totalSteps = timer / stepsEveryMs;

      /* Config progress bar */
      var $element = this.element.find('.timer');
      var backgroundColor = '#d3d3d3';
      var barColor = '#676767';

      /* Start progress interval */
      this.progressInterval = setInterval(function() {
        if (stepsDrawn <= totalSteps) {
          /* Calc percentage */
          var percentage = stepsDrawn * 100 / totalSteps;

          /* Sum steps */
          stepsDrawn = stepsDrawn + 1;

          /* Draw progress bar with the current percentage */
          drawProgressBar($element, percentage, backgroundColor, barColor);
        }
        else {
          clearInterval(this.progressInterval);
        }
      }, stepsEveryMs);
    },

    /* Automatic functions */

    _makeItAutomatic: function() {
      var self = this;

      /* Reset interval if it's initialized */
      clearInterval(this.mainInterval);
      clearInterval(this.progressInterval);

      /* Create interval */
      this.mainInterval = setInterval(function() {
        /* Slides to next item */
        var slide = self.currentSlide;

        slide++;

        /* Top limit */
        if (slide === self.$slides.length) {
          slide = 0;
        }

        /* Move progress bar if exists */
        if (self.options.addControls) {
          self._startProgressBar();
        }

        /* Go to the new slide */
        self._goToSlide(slide, false);
      }, this.options.timeOut);
    },

    _controlHover: function() {
      this._on(this.element, {
        'mouseover .slides li': function() {

        }
      });

      this._on(this.element, {
        'mouseout .slides li': function() {

        }
      });
    },

    _bindStartStop: function() {
      this._on(this.element, {
        'start': function() {
          /* Restart the slider */
          this._makeItAutomatic();
        },

        'stop': function() {
          /* Clear interval the slider interval */
          clearInterval(this.mainInterval);
        }
      });
    },

    /* Play / stop */

    _stopSlider: function() {
      /* Add class paused */
      this.element.find('.timer').addClass('paused');

      /* Clear interval the slider interval */
      clearInterval(this.mainInterval);
      clearInterval(this.progressInterval);
    },

    _playSlider: function() {
      /* Remove class paused */
      this.element.find('.timer').removeClass('paused');

      /* Restart the slider */
      this._makeItAutomatic();

      /* Move progress bar if exists */
      if (this.options.addControls) {
        this._startProgressBar();
      }

    },

    /* Animate functions */

    _goToSlide: function(slide, restartInterval) {

      /* Make the change just if it's not currently animating */
      if (!this.element.hasClass('animating')) {

        /* Set animating status */
        this.element.addClass('animating');

        /* Default animate behaviour */
        this._animate(slide, restartInterval);

        /* Update new currentSlide */
        this.currentSlide = slide;

        /* Set the current paginator active */
        this.element.find('.paginator .active').removeClass('active');
        this.element.find('.paginator li').eq(Math.floor(this.currentSlide / this.options.activeElements)).addClass('active');
      }

    },

    _animate: function(slide, restartInterval) {
      var $active = this.element.find('.slides > ul > li.active');
      var $nextActive = this.element.find('.slides > ul > li').slice(slide, slide + this.options.activeElements);
      var self = this;

      $active.fadeOut(1200, 'easeInOutExpo', function() {
        /* Remove last active class */
        $active.removeClass('active');
      });

      $nextActive.fadeIn(1200, 'easeInOutExpo', function() {
        /* Remove animating class and add active */
        $nextActive.addClass('active').removeClass('animating');

        /* Finish the animation and remove the blocking class */
        self.element.removeClass('animating');

        /* Restart interval */
        if (restartInterval && self.options.automatic) {
          self._makeItAutomatic();
        }
      });

      /* Trigger Change slide */
      this.element.trigger('change_slide');
    }

  });

  $.extend($.ui.ui_slider, {
    instances: []
  });

})(jQuery);