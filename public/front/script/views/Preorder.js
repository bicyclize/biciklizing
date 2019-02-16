Hydra.module.register('Preorder', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#preorder',
    element: undefined,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init form */
      this.initForm();

      /* Print button */
      this.initPrint();
    },

    initPrint: function() {
      this.element.find('.print a').on('click', function(event) {
        event.preventDefault();
        window.print();
      });
    },

    initForm: function() {
      var self = this;
      var $form = this.element.find('form');
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
          var path = '/send_preorder';

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
            $button.css('width', $button.width() + 1);

            setTimeout(function() {
              /* Fade out the content */
              $buttonContent.fadeOut(200);

              /* Fade out the progress bar */
              $progressBar.fadeOut(200, function() {
                /* Fade in the success button */
                $success.fadeIn(200, function() {

                  /* Fill the preorder */
                  self.element.find('.preorder_form .confirm dd span').each(function() {
                    var $this = $(this);
                    var className = $this.attr('class');
                    var textValue = values[className];

                    if (className == 'order_country' || className == 'order_size' || className == 'order_color') {
                      textValue = self.element.find('select[name=' + className + ']').find('option[value=' + values[className] + ']').text();
                    }
                    else if (className == 'order_options') {
                      textValue = '';
                      if (values[className]) {
                        $.each(values[className], function(index, value) {
                          textValue += self.element.find('input[name="order_options.' + index + '"]').closest('.field_wrapper').find('label span').text();
                          textValue += ', ';
                        });
                      }

                      textValue = textValue.slice(0,-2);
                    }

                    $this.text(textValue);
                  });

                  /* Show the preorder */
                  self.element.find('.page').css({
                    height: self.element.find('.page').height()
                  });

                  $('#preorder').stop().animate({
                    scrollTop: 0
                  }, 300, 'easeInOutExpo', function() {


                    self.element.find('.page').find('.default').fadeOut(400, function() {});
                    setTimeout(function() {
                      self.element.find('.page').find('.confirm').fadeIn(400);
                    }, 401);

                    /* Reset the submit button */
                    setTimeout(function() {
                      $success.fadeOut(200, function() {
                        $buttonContent.fadeIn(200, function() {
                          $button.removeAttr('disabled');
                          $button.removeAttr('width');
                          $progressBar.css({
                            width: 0,
                            display: 'block'
                          });
                        });

                      });
                    }, 1500);


                  });


                });
              });
            }, 400);


          });
        }

      });
    }
  };
});