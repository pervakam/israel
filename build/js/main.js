'use strict';

(function () {
  var ESC_KEY = 'Escape';

  var callbackModalHide = document.querySelector('.callback-modal-hide');
  var telField = document.getElementById('phone-field');
  var callbackModal = document.querySelector('.callback-modal');
  var callbackCloseButton = document.querySelector('.callback-modal__close');
  var callbackOpenButton = document.querySelector('.page-header__contact-callback');

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
