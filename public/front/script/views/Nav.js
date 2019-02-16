Hydra.module.register('Nav', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'Nav': {
        'showMainPage': function(oNotify) {
          this.showMainPage(oNotify.page, oNotify.firstLoad);
        },
        'showStatic': function(oNotify) {
          if (oNotify.page) this.showStatic(oNotify.page);
        },
        'showPreorder': function(oNotify) {
          this.showPreorder(oNotify.referer);
        }
      }
    },

    selector: '.main_wrapper',
    element: undefined,
    moving: false,
    timeSinceWheel: null,
    $staticContainer: undefined,
    lastId: 'first',

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
      this.$staticContainer = this.element.closest('body').find('.static_pages');

      /* Nav functions */
      this.clickOnLogo();
      this.toggleMenu();
      this.downArrows();
      this.resizeEvent();
      this.navEvents();
      this.listenMouseWheel();
      this.initKeyboard();
      this.scrollSpy();
      this.startAccesories();
      this.contactForm();
      this.aboutClose();
      //this.socialForm();
    },

    clickOnLogo: function() {
      var self = this;

      this.element.closest('body').find('#header .logo h1').on('click', function(event) {
        event.preventDefault();
        var $destinyBlock = $('#home');
        self.navigateToScreen($destinyBlock, true);
      });
    },

    showMainPage: function(page, firstLoad) {
      var $destinyBlock = $('#' + page);
      if (!firstLoad) {
        this.lastId = page;
      }
      this.navigateToScreen($destinyBlock, false);
    },

    showPreorder: function(referer) {
      var self = this;
      var $backToBike = this.element.closest('body').find('.back_to_bike a');
      var $preorderLogo = this.element.closest('body').find('#preorder .logo p');

      $backToBike.off('click');
      $backToBike.on('click', function(event) {
        event.preventDefault();

        if (referer) {
          window.location.hash = '#/' + referer;
        }
        else {
          window.location.hash = '#/home';
        }

        $('body').removeClass('view_preorder');
      });

      $preorderLogo.off('click');
      $preorderLogo.on('click', function(event) {
        event.preventDefault();

        var $destinyBlock = $('#home');
        self.navigateToScreen($destinyBlock, true);
        window.location.hash = '#/home';
        $('body').removeClass('view_preorder');
        //$backToBike.trigger('click');
      });

      /* Show preorder */
      this.element.closest('#wrapper').find('.nav').removeClass('opened');
      $('body').addClass('view_preorder');
    },

    toggleMenu: function() {
      var $iconMenuPreorder = this.element.closest('body').find('#preorder').find('.icon_menu a');
      var $iconMenu = this.element.closest('#wrapper').find('.icon_menu a');
      var $closeNav = this.element.closest('#wrapper').find('.close_nav a');
      var $nav = this.element.closest('#wrapper').find('.nav');

      $iconMenu.on('click', function(event) {
        event.preventDefault();

        $nav.addClass('opened');
      });

      $iconMenuPreorder.on('click', function(event) {
        event.preventDefault();

        $nav.addClass('opened');
      });

      $closeNav.on('click', function(event) {
        event.preventDefault();

        $nav.removeClass('opened');
      });

    },

    downArrows: function() {
      var self = this;
      var $arrows = this.element.find('.down_arrow p a');

      $arrows.on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var id = $this.attr('href');
        var $destinyBlock = $(id);

        self.navigateToScreen($destinyBlock, true);
      });
    },

    resizeEvent: function() {
      var self = this;
      var $indexContent = $('#nav .nav');

      $(window).resize(function() {
        var $activeLink = $indexContent.find('li.active a');
        var id = $activeLink.attr('href');
        var $destinyBlock = $(id);

        if (!($('body').hasClass('view_preorder') || $('body').hasClass('view_static'))) {
          self.navigateToScreen($destinyBlock, false);
        }
      });
    },

    navEvents: function() {
      var self = this;
      var $indexContent = $('#nav .nav > ul').not('.social');

      $indexContent.find('a').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var id = $this.attr('href');
        var $destinyBlock = $(id);

        self.navigateToScreen($destinyBlock, true);
      });
    },

    listenMouseWheel: function() {
      var $body = $('body');
      var self = this;

      $body.bind('mousewheel', function(event) {

        var delta = event.deltaY;

        /* Navigate only in desktop screens */
        if ($body.width() < 1024 || $body.hasClass('view_preorder') || $body.hasClass('view_static')) {
          return true;
        }

        /* Prevent two events in less than 1400 ms */
        var d = new Date();
        var t = d.getTime();
        if (t <= self.timeSinceWheel + 1400) {
          return false;
        }

        /* Figure out where to go */
        var $destinyBlock;

        /* Move scroll */
        if (!self.moving) {
          if (delta > 0) {
            $destinyBlock = self.getPrevBlock();
          }
          else {
            $destinyBlock = self.getNextBlock();
          }

          self.navigateToScreen($destinyBlock, true);
        }
        else {
          event.preventDefault();
        }

        self.timeSinceWheel = t;
        return false;
      });
    },

    initKeyboard: function() {
      var self = this;

      $(document).keydown(function(e) {
        /* Prevent two events in less than 800 ms */
        var d = new Date();
        var t = d.getTime();
        if (t <= self.timeSinceWheel + 800) {
          //return false;
        }

        switch (e.keyCode) {
          case 40:
            /* Down key */
            if (!self.moving) {
              var $destinyBlock = self.getNextBlock();
              self.navigateToScreen($destinyBlock, true);
            }
            return false;
            break;
          case 38:
            /* Up key */
            if (!self.moving) {
              var $destinyBlock = self.getPrevBlock();
              self.navigateToScreen($destinyBlock, true);
            }

            return false;
            break;
        }
      });
    },

    scrollSpy: function() {
      var self = this;
      var $window = $(window);
      var $scrollItems = this.element.find('.page');
      var $indexContent = $('#nav .nav');
      var $indexLinks = $indexContent.find('li');
      var $activeItem, activeId;

      /* Set the first item as active */
      $indexLinks.eq(0).addClass('active');

      /* Bind scroll */
      this.element.on('scroll', function() {
        var scrollTop = self.element.scrollTop(); /* Current scroll position */
        //console.log(scrollTop);

        /* Get the active item */
        $activeItem = $scrollItems.map(function() {
          //if ($(this).offset().top - 200 <= scrollTop) {
          if ($(this).offset().top < 200) {
            return this;
          }
        });

        /* Get the last active item */
        $activeItem = $activeItem.last();

        /* Get the id active item */
        activeId = $activeItem.attr('id');

        if (self.lastId != activeId) {
          /* Clean active links */
          $indexLinks.removeClass('active');

          /* Set active link */
          if (activeId) {
            $indexLinks.find('a[href=#' + activeId+']').closest('li').addClass('active');
          }
          else {
            $indexLinks.eq(0).addClass('active');
          }

          /* Change hash */
          Bus.publish('hash', 'change', {hash: activeId});

        }

        /* Save the last id */
        self.lastId = activeId;

      });
    },

    getPrevBlock: function() {
      var $indexContent = $('#nav .nav');
      var $activeLink = $indexContent.find('li.active');
      var id = $activeLink.find('a').attr('href');
      var $activeBlock = $(id);

      if ($activeBlock.prev().length > 0) {
        return $activeBlock.prev();
      }
      else {
        return $activeBlock;
      }
    },

    getNextBlock: function() {
      var $indexContent = $('#nav .nav');
      var $activeLink = $indexContent.find('li.active');
      var id = $activeLink.find('a').attr('href');
      var $activeBlock = $(id);

      if ($activeBlock.next().length > 0) {
        return $activeBlock.next();
      }
      else {
        return $activeBlock;
      }
    },

    navigateToScreen: function($destinyBlock, animation) {
      var duration = 0;
      var self = this;
      var $superHeader = $('#superheader');
      var position;
      var scrollTop = self.element.scrollTop(); /* Current scroll position */

      self.moving = true;

      if (animation) {
        duration = 800;
      }

      this.$staticContainer.hide();
      this.element.show();
      this.element.closest('#wrapper').find('.nav').removeClass('opened');
      $('body').removeClass('view_static').removeClass('view_preorder');

      position = $destinyBlock.offset().top + $('.main_wrapper').scrollTop() -  $superHeader.height();

      Bus.publish('scroll', 'scrollTo', {
        element: this.element,
        position: position,
        duration: duration,
        callback: function() {
          /* Unblock moving class */
          self.moving = false;
        }
      });
    },

    showStatic: function(page) {
      var self = this;

      this.element.fadeOut(function() {
        var $thisPage = self.$staticContainer.find('#' + page);

        $('body').removeClass('view_preorder');
        $('body').addClass('view_static');
        self.element.closest('#wrapper').find('.nav').removeClass('opened');

        /* Hide all pages */
        self.$staticContainer.find('.page').hide();

        /* Show this page */
        $thisPage.show();

        /* Show container */
        self.$staticContainer.fadeIn();
      });
    },

    startAccesories: function() {
      var self = this;
      var $optionsContent = $('#options');
      var total = $optionsContent.find('.multiple_pages .page_wrapper').length;
      var $pageSlider = $optionsContent.find('.page_slider');
      var $pageSliderUl = $optionsContent.find('.page_slider ul');
      var $pageSliderControl = $optionsContent.find('.page_slider .controls');
      var step = 0;
      var totalSteps = 1;

      /* Counter */
      $optionsContent.find('.multiple_pages .page_wrapper').each(function(i) {
        var $this = $(this);

        $this.find('.section_title').append('<span class="counter">(' + (i+1) + '/' + total +')');
      });

      /* Active status */
      $optionsContent.find('.page_wrapper').eq(0).addClass('active');
      $optionsContent.find('.page_slider li').eq(0).addClass('active');

      /* Event click */
      $optionsContent.find('.page_slider ul li a').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var id = $this.attr('data-page');
        var $destinyBlock = $optionsContent.find('.page_wrapper[data-page=' + id +']');

        /* Change menu */
        $optionsContent.find('.page_slider li.active').removeClass('active');
        $this.closest('li').addClass('active');

        /* Change content */
        $optionsContent.find('.page_wrapper.active').removeClass('active');
        $destinyBlock.addClass('active');
      });

      /* Listen arrows */
      $optionsContent.find('.page_slider .controls a').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        var $this = $(this);
        var height = $pageSlider.find('ul').height();

        /* Return if there's no need of arrows */
        if (height <= 42) return;

        /* Calc steps */
        totalSteps = parseInt(height / 42);

        if ($this.closest('.left_arrow').length) {
          step = step-1;

          if (step < 0) {
            step = totalSteps;
          }
        }
        else {
          step = step+1;

          if (step >= totalSteps) {
            step = 0;
          }
        }

        $optionsContent.find('.page_slider ul').css('margin-top', (step * -42));
      });

      /* Resize event to control when we have to show the controls */
      $(window).resize(function() {
        self.resizeControls();
      });

      /* Execute once */
      this.resizeControls();
    },

    resizeControls: function() {
      var $optionsContent = $('#options');
      var $pageSliderUl = $optionsContent.find('.page_slider ul');
      var $pageSliderControl = $optionsContent.find('.page_slider .controls');
      var ulHeight = $pageSliderUl.height();

      if (ulHeight > 42) {
        $pageSliderControl.addClass('visible');
      }
      else {
        $pageSliderControl.removeClass('visible');
      }

    },

    contactForm: function() {
      var $form = this.element.find('.page.info .contact_form form');
      var $button = $form.find('.submit input, .submit button');
      var $buttonContent = $form.find('.content');
      var $progressBar = $button.find('.progress .progress-inner');
      var $success = $button.find('.success');

      /* Reset */
      $button.removeAttr('disabled');

      $form.form({
        onSubmit: function(form) {
          /* Disable */
          $button.attr('disabled', 'disabled');

          /* Send to the back end */
          var values = $form.serializeObject();
          var path = '/send_mail';

          /* Ajax call */
          $.ajax({
            url: path,
            type: 'POST',
            data: values,
            cache: false,
            success: function (data) {

            }
          });


          /* Width bar */
          $progressBar.animate({
            width: '100%'
          }, 1200, "linear", function() {
            /* Set the width */
            $button.css('width', $button.width());

            setTimeout(function() {
              /* Fade out the content */
              $buttonContent.fadeOut(200);

              /* Fade out the progress bar */
              $progressBar.fadeOut(200, function() {
                /* Fade in the success button */
                $success.fadeIn(200, function() {
                  setTimeout(function() {
                    $success.fadeOut(200, function() {
                      $buttonContent.fadeIn(200, function() {

                        /* Reset */
                        $button.removeAttr('disabled');
                        $button.removeAttr('width');
                        $progressBar.css({
                          width: 0,
                          display: 'block'
                        });

                        /* Clean form */
                        $form.find('.field').each(function() {
                          var $this = $(this);
                          $this.find('input').val('');
                          $this.find('textarea').val('');

                          $this.trigger('validate').addClass('initial_status');
                        });
                      });

                    });
                  }, 1500);
                });
              });
            }, 400);


          });
        }
      });

    },

    socialForm: function() {
      var $form = this.element.find('.page.info .col_social form');
      var $button = $form.find('.submit input, .submit button');
      var $buttonContent = $form.find('.content');
      var $progressBar = $button.find('.progress .progress-inner');
      var $success = $button.find('.success');

      /* Reset */
      $button.removeAttr('disabled');

      $form.form({
        onSubmit: function(form) {
          /* Disable */
          $button.attr('disabled', 'disabled');

          /* Send to the back end */
          var values = $form.serializeObject();
          var path = '/send_subscription';

          /* Ajax call */
          $.ajax({
            url: path,
            type: 'POST',
            data: values,
            cache: false,
            success: function (data) {

            }
          });


          /* Width bar */
          $progressBar.animate({
            width: '100%'
          }, 1200, "linear", function() {
            /* Set the width */
            $button.css('width', $button.width());

            setTimeout(function() {
              /* Fade out the content */
              $buttonContent.fadeOut(200);

              /* Fade out the progress bar */
              $progressBar.fadeOut(200, function() {
                /* Fade in the success button */
                $success.fadeIn(200, function() {
                  setTimeout(function() {
                    $success.fadeOut(200, function() {
                      $buttonContent.fadeIn(200, function() {

                        /* Reset */
                        $button.removeAttr('disabled');
                        $button.removeAttr('width');
                        $progressBar.css({
                          width: 0,
                          display: 'block'
                        });

                        /* Clean form */
                        $form.find('.field').each(function() {
                          var $this = $(this);
                          $this.find('input').val('');
                          $this.find('textarea').val('');

                          $this.trigger('validate').addClass('initial_status');
                        });
                      });

                    });
                  }, 1500);
                });
              });
            }, 400);


          });
        }
      });

    },

    aboutClose: function() {
      var self = this;

      $('.the_man_behind .close a').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        var $this = $(this);
        var id = $this.attr('href');
        var $destinyBlock = $(id);

        window.location.hash = '#/info';

        self.navigateToScreen($destinyBlock, true);
      });
    }

  };
});