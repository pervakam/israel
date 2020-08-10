'use strict';

(function () {
  var forms = document.querySelectorAll('form');
  var formInputs = document.querySelectorAll('input');

  var showSuccess = function (evt) {
    var formTelInput = evt.target.querySelector('input[type="tel"]');
    var formNameInput = evt.target.querySelector('input[type="text"]');

    evt.preventDefault();
    if (!window.callback.callbackModalHide) {
      window.callback.closeCallbackModal();
    }
    window.success.showSuccessModal(evt);

    localStorage.setItem(formTelInput.type, formTelInput.value);
    if (formNameInput !== null) {
      localStorage.setItem(formNameInput.type, formNameInput.value);
    }

    forms.forEach(function (form) {
    })

  };

  var showInvalidBorder = function (formField) {
    formField.classList.add('invalid-input');
    formField.addEventListener('click', function () {
      formField.classList.remove('invalid-input');
    });
  };

  var setValue = function () {
    formInputs.forEach(function (input) {
      input.value = localStorage.getItem(input.type);
    })
  };

  formInputs.forEach(function (formField) {
    formField.addEventListener('invalid', function () {
      showInvalidBorder(formField)
    });

  });

////// отправка формы обратного звонка и запись в localStorage ///////////
  forms.forEach(function (form) {
    form.addEventListener('submit', showSuccess);
  });
  window.addEventListener('load', setValue);


////// валидация ввода номера телефона ///////////
  $('input[type="tel"]').mask('+7 000-000-00-00',
    {
      placeholder: 'телефон',
      selectOnFocus: true,
    });
})();
