'use strict';

(function () {
  var successModal = document.querySelector('.success-modal');
  var successCloseButton = document.querySelector('.success-modal__close');
  var successOkButton = document.querySelector('.success-modal__ok');

  var closeSuccessModal = function () {
    successModal.classList.add('success-modal-hide');
    window.callback.body.classList.remove('no-scroll');

    successCloseButton.removeEventListener('click', closeSuccessModal);
    successOkButton.removeEventListener('click', closeSuccessModal);
    window.removeEventListener('keydown', escSuccessModalHandler);
    document.removeEventListener('click', overlaySuccessModalHandler);
  };

  var escSuccessModalHandler = function (evt) {
    if (evt.key === window.utils.ESC_KEY) {
      evt.preventDefault();
      closeSuccessModal();
    }
  };

  var overlaySuccessModalHandler = function (evt) {
    if (evt.target !== window.callback.callbackOpenButton && evt.target !== successModal && !successModal.contains(evt.target)) {
      closeSuccessModal()
    }
  };

  var closeSuccessModalByClick = function () {
    successCloseButton.addEventListener('click', closeSuccessModal);
    successOkButton.addEventListener('click', closeSuccessModal);
    window.addEventListener('keydown', escSuccessModalHandler);
    document.addEventListener('click', overlaySuccessModalHandler);
  };

  var showSuccessModal = function (evt) {
    evt.preventDefault();
    successModal.classList.remove('success-modal-hide');
    window.callback.body.classList.add('no-scroll');

    closeSuccessModalByClick();
  };

  window.success = {
    showSuccessModal: showSuccessModal
  }
})();
