(function($) {

  $.widget("ui.form_field", {
    options: {
    },

    /* Form reference */
    form: undefined,

    /* Validation variables, direct from html data attributes */
    required: false,
    requiredIf: '',
    format: '',
    requiredError: '',
    formatError: '',

    /* Component attributes for groups (radiobuttons for example) */
    grouped: false,
    group: '',

    /* Internal validation vars */
    valid: true, /* Flag to indicate whether the field is valid for require input and format */
    initialStatus: true,

    /* Default formats */
    formats : {
      email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
      alpha: /^[a-zA-Z]+$/,
      alphanum: /^[a-zA-Z0-9]+$/,
      phone: /^[0-9]{1,11}$/,
      password: /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/,
      ddmmyyyy: /^((0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/,
      mmyyyy: /^((0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/,
      mmddyyyy: /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/,
      creditcard: /^\d{12,19}$/,
      cvv: /^\d{3,4}$/,
      locator: /^[a-zA-Z0-9]{6}$/,
      ticket_number: /^[0-9]{13}$/,
      flight_number: /^[0-9]{2,4}$/,
      postal_code: /^[0-9]{5,7}$/,
      name: function(inputValue, field) {
        var valid = false;

        if (inputValue.length > 1 && inputValue.length < 71) {
          valid = true;
        }

        return valid;
      },
      dni: function(inputValue, field) {
        var valid = false;
        var format = /(^([0-9]{6,8}[a-zA-Z])|^)$/;

        /* Create the regexp */
        var regExp = new RegExp(format);

        // console.log("inputValue: " + inputValue)

        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
        }

        if (valid) {
          var number = inputValue.substring(0, inputValue.length-1);
          var letter = inputValue.charAt(inputValue.length-1);
          var lettersString = "TRWAGMYFPDXBNJZSQVHLCKET";
          var position = number % 23;
          var calcLetter = lettersString.substring(position, position+1);

          // console.log('calcLetter: ' + calcLetter)
          // console.log('calcLetter: ' + letter.toUpperCase())

          if (calcLetter != letter.toUpperCase()) {
            valid = false;
          }
          else {
            valid = true;
          }
        }

        return valid;
      },
      nie: function(inputValue, field) {
        inputValue = inputValue.toUpperCase();

        var valid = false;
        var format = /(^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$)/;

        /* Create the regexp */
        var regExp = new RegExp(format);

        // console.log("inputValue: " + inputValue)

        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
        }

        if (valid) {
          inputValue = inputValue.replace('X', '0').replace('Y', '1').replace('Z', '2');

          var number = inputValue.substring(0, inputValue.length-1);
          var letter = inputValue.charAt(inputValue.length-1);
          var lettersString = "TRWAGMYFPDXBNJZSQVHLCKET";
          var position = number % 23;
          var calcLetter = lettersString.substring(position, position+1);

          // console.log('calcLetter: ' + calcLetter)
          // console.log('calcLetter: ' + letter.toUpperCase())

          if (calcLetter != letter.toUpperCase()) {
            valid = false;
          }
          else {
            valid = true;
          }
        }

        return valid;
      },
      age: function(inputValue, field) {
        /* Get the values */
        var valid = false;
        var birthdayDate, passengerMaxDate, passengerMinDate;
        var format = /^((0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/;
        var flightDate = field.element.attr('data-last-flight');
        var lastFlightDepartureDate = moment(flightDate, 'DD/MM/YYYY HH:mm');
        var age = field.element.attr('data-age');

        // console.log(flightDate)

        /* Create the regexp */
        var regExp = new RegExp(format);

        /* Validate format */
        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
          else {
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-format-error');
          }
        }

        /* Clean posible other formats */
        inputValue = inputValue.replace(/-/gi, '/');
        inputValue = inputValue.replace(/ /g, '/');
        inputValue = inputValue.replace(/\./g, '/');

        /* Validate age */
        if (valid) {
          birthdayDate = moment(inputValue, 'DD/MM/YYYY');

          if (age == 'kid') {
            passengerMaxDate = lastFlightDepartureDate.clone().subtract('years', 2);
            passengerMinDate = lastFlightDepartureDate.clone().subtract('years', 12).add('days', 1);
          }
          else if (age == 'baby') {
            passengerMaxDate = lastFlightDepartureDate.clone();
            passengerMinDate = lastFlightDepartureDate.clone().subtract('years', 2).add('days', 1);
          }
          else {
            passengerMaxDate = lastFlightDepartureDate.clone().subtract('years', 12);
            passengerMinDate = lastFlightDepartureDate.clone().subtract('years', 120);
          }

          if (!(birthdayDate.isBefore(passengerMaxDate) && birthdayDate.isAfter(passengerMinDate))) {
            valid = false;
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-age-error');
          }
        }

        /* If it's valid update the value */
        if (valid) {
          field.element.find('input').val(inputValue);
        }

        return valid;
      },
      expiration: function(inputValue, field) {
        var valid = false;
        var today = moment();
        var expirationDate;
        var format = /^((0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/;

        /* Create the regexp */
        var regExp = new RegExp(format);

        /* Validate format */
        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
          else {
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-format-error');
          }
        }

        /* Clean posible other formats */
        inputValue = inputValue.replace(/-/gi, '/');
        inputValue = inputValue.replace(/ /g, '/');
        inputValue = inputValue.replace(/\./g, '/');

        /* Validate date */
        if (valid) {
          expirationDate = moment(inputValue, 'DD/MM/YYYY');

          if (!today.isBefore(expirationDate)) {
            valid = false;
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-date-error');
          }
        }

        /* If it's valid update the value */
        if (valid) {
          field.element.find('input').val(inputValue);
        }

        return valid;
      },
      expiration_card: function(inputValue, field) {
        var valid = false;
        var today = moment();
        var expirationDate;
        var format = /^((0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/;

        /* Create the regexp */
        var regExp = new RegExp(format);

        /* Validate format */
        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
          else {
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-format-error');
          }
        }

        /* Clean posible other formats */
        inputValue = inputValue.replace(/-/gi, '/');
        inputValue = inputValue.replace(/ /g, '/');
        inputValue = inputValue.replace(/\./g, '/');


        /* Validate date */
        if (valid) {
          expirationDate = moment('31/'+ inputValue, 'DD/MM/YYYY');

          if (!today.isBefore(expirationDate)) {
            valid = false;
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-date-error');
          }
        }

        /* If it's valid update the value */
        if (valid) {
          field.element.find('input').val(inputValue);
        }

        return valid;
      },
      email_list: function(inputValue, field) {
        var valid = false;
        var format = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},*[\W]*)+$/g;

        /* Create the regexp */
        var regExp = new RegExp(format);

        /* Validate format */
        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
          else {
            field.element.find('.error_hint').remove();
            field.formatError = field.element.attr('data-format-error');
          }
        }

        return valid;
      }
    },

    /* Create and destroy */

    _create: function() {
      /* Init vars */
      this.customInit();

      /* Prepare hint messages to show them when needed */
      this._prepareHints();

      /*
      Listen validate events. For every field types first will validate if it's a required value or not, after that
      it will validate if the format is valid. As long as each field type has its own input types, some of them more
      than one combined, every field type should implement both validation methods: required and format.
      */
      this._validateListener();

      /* Listen to show error events */
      this._errorListener();

      /* Set valid/invalid listeners */
      this._statusListener();

    },

    _init: function() {
    },

    customInit: function() {
      /* Push this instance into the $.ui object */
      $.ui.form_field.instances.push(this.element);

      /* Save dad form reference */
      this.form = this.options.form;

      /* Set initial satus */
      this.initialStatus = true;
      this._itsFirstValidation();

      /* Save validation data on the instance */
      this.required = (this.element.attr('data-required') == 'true');
      this.format = this.element.attr('data-format');
      this.grouped = (this.element.attr('data-group') != undefined);
      this.requiredError = this.element.attr('data-required-error');
      this.formatError = this.element.attr('data-format-error');

      /* Set the group name */
      if (this.grouped) this.group = this.element.data('group');

      /* Change valid flag to false to start validation protocol */
      if (this.required) this.valid = false;
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.form_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.form_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.form_field.instances, function(el) {
        return el !== element;
      });
    },

    /* Hints */

    _prepareHints: function() {

      var self = this;

      if (this.element.find('.hint').length > 0) {

        this.element.find('.hint').each(function() {
          var $this = $(this);
          var hintWidth = self._calcHintWidth($this);

          /* Set the width to the hint */
          $this.css('width', hintWidth);
        });
      }

      /* Close event */
      this.element.on('click', '.hint .close_hint', function(event) {
        event.preventDefault();

        var $a = $(this);
        var $hint = $a.closest('.hint');

        $hint.fadeOut(300);
      });

    },

    _calcHintWidth: function($hint) {
      /* Calc widths */
      var $dummyHint = $hint.clone();
      $dummyHint.addClass('hidden');
      $('body').append($dummyHint);
      var hintWidth = $dummyHint.width() + 30; /* +30 to avoid errors with typography length */
      $dummyHint.remove();

      return hintWidth;
    },

    /* Listeners */

    _validateListener: function() {
      this._on(this.element, {
        'validate': function(event, isModified) {

          /* Modified to 'true' by default if not specified */
          if (typeof isModified == 'undefined') isModified = true;

          /* Avoid the default behaviour which would execute validate event in the parent widgets */
          event.stopPropagation();

          var valid = true;

          /* If the item is required */
          if (this.required) {

            /* Test if it's required */
            valid = this._testRequired();

            /* If the format is established, test the format */
            if (valid && this.format != undefined) {
              valid = this._testFormat();
            }
          }
          else { /* If it's not required but it has a format validation: can be void, but in case to be filled it need to fit the format */
            if (this.format != undefined) {
              valid = this._testFormat(true);
            }
          }

          /* Valid/unvalid operations */
          if (valid) {
            this._itsValid();
          }
          else {
            this._itsInvalid();
          }

          /* Initial validation */
          if (!this.initialStatus && isModified) {
            this._itIsntFirstValidation();
          }

          /* Assign valid variable to object valid property just once */
          this.valid = valid;

          /* Trigger parent form method to set/unset the ready status */
          if (!this.initialStatus) {
            this.options.form.element.trigger('validate');
          }

          /* Set initial status to false */
          this.initialStatus = false;
        }
      });
    },

    _errorListener: function() {
      this._on(this.element, {
        'show_error': function(event, error) {

          event.stopPropagation();

          var recalcWidth = false;
          var error_hint = '<div class="hint error_hint"><a href="#" class="close_hint"><span>Cerrar</span></a></div>';

          /* Create div.messages if it doesn't exist yet */
          if (!this.element.find('.error_hint').length) {
            recalcWidth = true;

            if (this.element.find('.field_wrapper').length > 0) {
              this.element.find('.field_wrapper').append(error_hint);
            }
            else {
              this.element.append(error_hint);
            }
          }

          /* Save a reference of that div */
          var $error_hint = this.element.find('.error_hint');

          /* Clean previous errors */
          $error_hint.find('.error_message').remove();

          /* Append new error */
          $error_hint.append('<span class="error_message">' + error + '</span>');

          /* Calc width */
          if (recalcWidth) {
            var hintWidth = this._calcHintWidth($error_hint);
            $error_hint.css('width', hintWidth);
          }
        }
      });
    },

    _statusListener: function() {
      /* Event to access it from other elements without reference */
      this._on(this.element, {
        'set_valid': function(event, valid) {
          this.valid = valid;
        }
      });

      /* Set the require property from outside the component */
      this._on(this.element, {
        'set_required': function(event) {
          this.required = required;

          /* Set the data-required to true/false */
          this.element.attr('data-required', required);

          /* Trigger validate to set the new status */
          this.trigger('validate');
        }
      });
    },

   /* Required methods, if needed, each component must implement its own */

    _refresh: function() {},

    /*
    Validate required methods, each component MUST implement its own method, by default set to true to don't
    break validation workflow if any component doesn't implement the methods.
    */

    _testRequired: function() { return true; },

    _testFormat: function() { return true; },

    /* Result methods */

    _itsValid: function() {
      /* Add valid class, in order to show valid fields if necessary, if it's grouped change all group fields */
      if (!this.grouped) {
        this.element.removeClass('error').addClass('valid');
      }
      else { /* For all fields of the group */
        this.form.element.find('[data-group=' + this.group + ']').removeClass('error').addClass('valid').trigger('set_valid', [true]);
      }
    },

    _itsInvalid: function() {
      /* Remove valid class, in order to show valid fields if necessary, if it's grouped change all group fields */
      if (!this.grouped) {
        this.element.removeClass('valid').addClass('error');
      }
      else { /* For all fields of the group */
        this.form.element.find('[data-group=' + this.group + ']').removeClass('valid').addClass('error').trigger('set_valid', [false]);
      }
    },

    /* Initial status flag */

    _itsFirstValidation: function() {
      /* Add valid class, in order to show valid fields if necessary, if it's grouped change all group fields */
      if (!this.grouped) {
        this.element.addClass('initial_status');
      }
      else { /* For all fields of the group */
        this.form.element.find('.field[data-group=' + this.group + ']').addClass('initial_status');
      }
    },

    _itIsntFirstValidation: function() {
      /* Add valid class, in order to show valid fields if necessary, if it's grouped change all group fields */
      if (!this.grouped) {
        this.element.removeClass('initial_status');
      }
      else { /* For all fields of the group */
        this.form.element.find('.field[data-group=' + this.group + ']').removeClass('initial_status');
      }
    },

    /* Focused / blurred flag, every component can call to this functions when needed, not every field types get the focus in the same way */

    _setFocused: function() {
      /* Set field focused */
      this.element.addClass('focused');

      /* Set form focused */
      this.form.element.addClass('field_focused');
    },

    _setBlurred: function() {
      /* Set field focused */
      this.element.removeClass('focused');

      /* Set form focused */
      this.form.element.removeClass('field_focused');
    }

  });

  $.extend($.ui.form_field, {
    instances: []
  });

})(jQuery);