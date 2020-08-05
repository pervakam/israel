'use strict';

(function () {
  var callbackForm = document.querySelector('.callback-modal__form');
  var callbackFormNameField = callbackForm.querySelector('input[name="name-field"]');
  var callbackFormTelField = callbackForm.querySelector('input[name="tel-field"]');
  var formInputs = document.querySelectorAll('input');

  var helpForm = document.querySelector('.help__form');
  var helpFormTelField = helpForm.querySelector('input[name="tel-field"]');

  var contactsCallbackForm = document.querySelector('.contacts__callback-form');
  var contactsFormNameField = contactsCallbackForm.querySelector('input[name="name-field"]');
  var contactsFormTelField = contactsCallbackForm.querySelector('input[name="tel-field"]');

  var showSuccessModalForCallback = function (evt) {
    window.callback.closeCallbackModal();
    window.success.showSuccessModal(evt);
    localStorage.setItem('callbackFormName', callbackFormNameField.value);
    localStorage.setItem('callbackFormTel', callbackFormTelField.value);
    callbackForm.reset();
  };

  var showSuccessModalForHelp = function (evt) {
    window.success.showSuccessModal(evt);
    localStorage.setItem('helpFormTel', helpFormTelField.value);
    helpForm.reset();
  };

  var showSuccessModalForContacts = function (evt) {
    window.success.showSuccessModal(evt);
    localStorage.setItem('contactsFormName', contactsFormNameField.value);
    localStorage.setItem('contactsFormTel', contactsFormTelField.value);
    contactsCallbackForm.reset();
  };

  var showInvalidBorder = function (formField) {
    formField.classList.add('invalid-input');
    formField.addEventListener('click', function () {
      formField.classList.remove('invalid-input');
    });
  };

  formInputs.forEach( function (formField) {
    formField.addEventListener('invalid', function () {
      showInvalidBorder(formField)
    });
  });


////// отправка формы обратного звонка и запись в localStorage ///////////
  callbackForm.addEventListener('submit', showSuccessModalForCallback);

  helpForm.addEventListener('submit', showSuccessModalForHelp);

  contactsCallbackForm.addEventListener('submit', showSuccessModalForContacts);

////// валидация ввода номера телефона ///////////
  $('input[type="tel"]').mask('+7 000-000-00-00',
    {
      placeholder: 'телефон',
      selectOnFocus: true,
    });
})();


