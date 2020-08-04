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

  var localStorage = {}


  var showSuccessModalForCallback = function (evt) {
    window.callback.closeCallbackModal();
    window.success.showSuccessModal(evt);
    callbackForm.reset();
    // localStorage.setItem('callbackFormName', callbackFormNameField.value);
    // localStorage.setItem('callbackFormTel', callbackFormTelField.value);
  };



  var showSuccessModalForHelp = function (evt) {
    window.success.showSuccessModal(evt);
    localStorage['helpFormTel'] = helpFormTelField.value;
    // localStorage.setItem('helpFormTel', helpFormTelField.value);
    console.log(helpFormTelField.value);
    // helpForm.reset();
  };

  var showSuccessModalForContacts = function (evt) {
    window.success.showSuccessModal(evt);
    contactsCallbackForm.reset();
    // localStorage.setItem('contactsFormName', contactsFormNameField.value);
    // localStorage.setItem('contactsFormTel', contactsFormTelField.value);
  };

////// отправка формы обратного звонка ///////////
  callbackForm.addEventListener('submit', showSuccessModalForCallback);

  helpForm.addEventListener('submit', showSuccessModalForHelp);

  contactsCallbackForm.addEventListener('submit', showSuccessModalForContacts);

////// валидация ввода номера телефона ///////////
  $('input[type="tel"]').mask('+7 000-000-00-00',
    {
      placeholder: "телефон",
      selectOnFocus: true
    });

////// запись в localStorage ///////////
//   var telCallbackModalField = document.getElementById('tel-field');
//   var nameCallbackModalField = document.getElementById('name-field');
  var telHelpField = document.getElementById('phone-field');
//   var telContactsField = document.getElementById('phone');
//   var nameContactsField = document.getElementById('name');

  // telHelpField.addEventListener('change', function () {
  //   telHelpField.value = localStorage.setItem('helpFormTel', telHelpField.value);
  //   console.log(telHelpField.value)
  // })


})();


