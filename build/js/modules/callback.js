'use strict';

(function () {
  var body = document.querySelector('body');
  var callbackModalHide = document.querySelector('.callback-modal-hide');
  var callbackModal = document.querySelector('.callback-modal');
  var callbackCloseButton = document.querySelector('.callback-modal__close');
  var callbackOpenButton = document.querySelector('.page-header__contact-callback');
  var callbackForm = document.querySelector('.callback-modal__form');
  var callbackFormNameField = callbackForm.querySelector('input[name="name-field"]');

  var closeCallbackModal = function () {
    callbackModal.classList.add('callback-modal-hide');
    body.classList.remove('no-scroll');
    callbackCloseButton.removeEventListener('click', closeCallbackModal);
    window.removeEventListener('keydown', escCallbackModalHandler);
    document.removeEventListener('click', overlayCallbackModalHandler);
  };

  var escCallbackModalHandler = function (evt) {
    if (evt.key === window.utils.ESC_KEY) {
      evt.preventDefault();
      closeCallbackModal();
    }
  };

  var overlayCallbackModalHandler = function (evt) {
    if (evt.target !== callbackOpenButton && evt.target !== callbackModal && !callbackModal.contains(evt.target)) {
      closeCallbackModal();
    }
  };

  var closeCallbackModalByClick = function () {
    callbackCloseButton.addEventListener('click', closeCallbackModal);
    window.addEventListener('keydown', escCallbackModalHandler);
    document.addEventListener('click', overlayCallbackModalHandler);
  };

  var openCallbackModal = function () {
    body.classList.add('no-scroll');
    callbackModal.classList.remove('callback-modal-hide');
    callbackFormNameField.focus();
    closeCallbackModalByClick();
  };

  if (callbackModalHide) {
    callbackOpenButton.addEventListener('click', openCallbackModal);
  }

  window.callback = {
    body: body,
    callbackOpenButton: callbackOpenButton,
    closeCallbackModal: closeCallbackModal
  }
})();
