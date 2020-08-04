'use strict';

(function () {
  var callbackForm = document.querySelector('.callback-modal__form');
  var callbackFormNameField = callbackForm.querySelector('input[name="name-field"]');
  var callbackFormTelField = callbackForm.querySelector('input[name="tel-field"]');

  var helpForm = document.querySelector('.help__form');
  var helpFormTelField = callbackForm.querySelector('input[name="phone-field"]');

  var contactsCallbackForm = document.querySelector('.contacts__callback-form');
  var contactsFormNameField = callbackForm.querySelector('input[name="name-field"]');
  var contactsFormTelField = callbackForm.querySelector('input[name="tel-field"]');

  var showSuccessModalForCallback = function (evt) {
    window.callback.closeCallbackModal();
    window.success.showSuccessModal(evt);
    callbackForm.reset();
    localStorage.setItem('callbackFormName', callbackFormNameField.value);
    localStorage.setItem('callbackFormTel', callbackFormTelField.value);
  };

  var showSuccessModalForHelp = function (evt) {
    window.success.showSuccessModal(evt);
    helpForm.reset();
    localStorage.setItem('helpFormTel', helpFormTelField.value);
  };

  var showSuccessModalForContacts = function (evt) {
    window.success.showSuccessModal(evt);
    contactsCallbackForm.reset();
    localStorage.setItem('contactsFormName', contactsFormNameField.value);
    localStorage.setItem('contactsFormTel', contactsFormTelField.value);
  };

////// отправка формы обратного звонка ///////////
  callbackForm.addEventListener('submit', showSuccessModalForCallback);

  helpForm.addEventListener('submit', showSuccessModalForHelp);

  contactsCallbackForm.addEventListener('submit', showSuccessModalForContacts);

////// валидация ввода номера телефона ///////////
  var telCallbackModalField = document.getElementById('tel-field');
  var telHelpField = document.getElementById('phone-field');
  var telContactsField = document.getElementById('phone');

  var telCheck = function (number) {
    number.onkeydown = function (evt) {
      if (evt.key === window.utils.BACKSPACE_KEY || evt.key === window.utils.DELETE_KEY) {
      } else {
        return (/^[0-9+()]$/.test(evt.key));
      }
    }
  };

  // if (telHelpField) {
  //   telCheck(telHelpField)
  // }

  if (telCallbackModalField) {
    telCheck(telCallbackModalField)
  }

  if (telContactsField) {
    telCheck(telContactsField)
  }
})();

(function () {
  $('#tel-field').mask('+7 000-000-00-00',
    {plazceholder: "телефон",
      selectOnFocus: true
    });

})();
