'use strict';

(function () {
  var ESC_KEY = 'Escape';

  var callbackModalHide = document.querySelector('.callback-modal-hide');
  var telField = document.getElementById('phone-field');
  var callbackModal = document.querySelector('.callback-modal');
  var callbackCloseButton = document.querySelector('.callback-modal__close');
  var callbackOpenButton = document.querySelector('.page-header__contact-callback');
  var callbackForm =document.querySelector('.callback-modal__form');
  var nameField = callbackForm.querySelector('input[name="name-field"]');

  var successModalHide = document.querySelector('.success-modal-hide');
  var successModal = document.querySelector('.success-modal');
  var successCloseButton = document.querySelector('.success-modal__close');
  var successOkButton = document.querySelector('.success-modal__ok');

  var closeSuccessModal = function () {
    successModal.classList.add('success-modal-hide');
  };

  var closeSuccessModalByClick = function () {
    successCloseButton.addEventListener('click', closeSuccessModal);
    successOkButton.addEventListener('click', closeSuccessModal);

    window.addEventListener('keydown', function (evt) {
      if (evt.key === ESC_KEY) {
        evt.preventDefault();
        closeSuccessModal();
      }
    });

    document.addEventListener('click', function (evt) {
      if (evt.target !== callbackOpenButton && evt.target !== successModal && !successModal.contains(evt.target)) {
        closeSuccessModal()
      }
    });
  };

  closeSuccessModalByClick();









  var closeCallbackModal = function () {
    callbackModal.classList.add('callback-modal-hide');
  };

  var closeCallbackModalByClick = function () {
    callbackCloseButton.addEventListener('click', closeCallbackModal);

    window.addEventListener('keydown', function (evt) {
      if (evt.key === ESC_KEY) {
        evt.preventDefault();
        closeCallbackModal();
      }
    });

    document.addEventListener('click', function (evt) {
      if (evt.target !== callbackOpenButton && evt.target !== callbackModal && !callbackModal.contains(evt.target)) {
        closeCallbackModal()
      }
    });
  };

  var openCallbackModal = function () {
    callbackModal.classList.remove('callback-modal-hide');
    nameField.focus();

    closeCallbackModalByClick();
  };

  if (callbackModalHide) {
    callbackOpenButton.addEventListener('click', openCallbackModal);
  }

  if (telField) {
    telField.onkeydown = function (evt) {
      return !(/^[А-Яа-яA-Za-z ]$/.test(evt.key));
    }
  }

})();
