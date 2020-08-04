'use strict';

(function () {
  var ESC_KEY = 'Escape';
  var BACKSPACE_KEY = 'Backspace';
  var DELETE_KEY = 'Delete';
  var TEL_PATTERN = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;

  var changeItem = function (arr, i, activeClass) {
    arr.forEach(function (item) {
      item.classList.remove(activeClass);
    });
    arr[i].classList.add(activeClass);
  };

  window.utils = {
    ESC_KEY: ESC_KEY,
    BACKSPACE_KEY: BACKSPACE_KEY,
    DELETE_KEY: DELETE_KEY,
    TEL_PATTERN: TEL_PATTERN,
    changeItem: changeItem
  }
})();

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



'use strict';

(function () {
  var programSwiperContainer = document.querySelector('.programs__name-container');
  var programSwiperWrapper = document.querySelector('.programs__name');
  var programTypeButton = document.querySelectorAll('.programs__name-item');
  var programTypeDescription = document.querySelectorAll('.programs__item-description');

  programTypeButton.forEach(function (button, i) {
    button.addEventListener('click', function () {
      window.utils.changeItem(programTypeButton, i, 'programs__item-active');
      window.utils.changeItem(programTypeDescription, i, 'programs__item-description--active');
    });
  });

  var swiperActivation = function () {
    programSwiperContainer.classList.add('swiper-container');
    programSwiperWrapper.classList.add('swiper-wrapper');
    programTypeButton.forEach(function (it) {
      it.classList.add('swiper-slide');
    });
    var swiper = new Swiper('.swiper-container');
  };

  var swiperDeactivation = function () {
    programSwiperContainer.classList.remove('swiper-container');
    programSwiperWrapper.classList.remove('swiper-wrapper');
    programTypeButton.forEach(function (it) {
      it.classList.remove('swiper-slide');
    })
  };

  if (window.matchMedia("(max-width: 767px)").matches) {
    swiperActivation()
  }

  var programDisplaySizeHandler = function () {
    if (window.innerWidth <= 767) {
      swiperActivation()
    } else if (window.innerWidth >= 768) {
      swiperDeactivation()
    }
  };

  window.addEventListener('resize', programDisplaySizeHandler);

})();

'use strict';

(function () {
  var faqList = document.querySelector('.faq__list');
  var answerHide = document.querySelector('.faq__item-answer--hide');
  var answerText = document.querySelectorAll('.faq__item-answer');

  if (!answerHide) {
    answerText.forEach(function (it) {
      it.classList.add('faq__item-answer--hide');
    });
  }

  var faqClickHandler = function(evt) {
    evt.preventDefault();

    var currentItem = evt.target.closest('.faq__list-item');
    var currentQuestion = currentItem.querySelector('.faq__item-question');
    var currentAnswer = currentItem.querySelector('.faq__item-answer');

    var previousQuestion = this.querySelector('.faq__item-question--active');
    var previousAnswer = this.querySelector('.faq__item-answer--active');

    var currentItemRemove = function () {
      currentQuestion.classList.remove('faq__item-question--active');
      currentAnswer.classList.remove('faq__item-answer--active');
    };

    var previousItemRemove = function () {
      previousQuestion.classList.remove('faq__item-question--active');
      previousAnswer.classList.remove('faq__item-answer--active');
    };

    var currentItemAdd = function () {
      currentQuestion.classList.add('faq__item-question--active');
      currentAnswer.classList.add('faq__item-answer--active');
    };


    if (currentQuestion.classList.contains('faq__item-question--active')) {
      currentItemRemove()
    } else if (previousQuestion) {
      previousItemRemove();
      currentItemAdd()
    } else {
      currentItemAdd()
    }
  };

  faqList.addEventListener('click', faqClickHandler)

})();

'use strict';

(function () {
  var reviewSlides = document.querySelectorAll('.review__list-item');
  var nextSlideButton = document.querySelector('.review__button--next');
  var prevSlideButton = document.querySelector('.review__button--prev');
  var sliderCounter = document.querySelector('.review__counter-item');
  var currentSlide = 2;

  var goToSlide = function (n) {
    reviewSlides.forEach(function (it) {
      it.classList.remove('review__list-item--active')
    });
    currentSlide = (n + reviewSlides.length) % reviewSlides.length;
    reviewSlides[currentSlide].classList.add('review__list-item--active');
    sliderCounter.textContent = currentSlide + 1 + " ";
  };

  var showNextSlide = function () {
    goToSlide(currentSlide + 1);
  };

  var showPrevSlide = function () {
    goToSlide(currentSlide - 1);
  };

  nextSlideButton.addEventListener('click', showNextSlide);
  prevSlideButton.addEventListener('click', showPrevSlide)
})();

'use strict';

(function () {
  var slideDescriptions = document.querySelectorAll('.about-life__item');
  var swiperWrapper = document.querySelector('.about-life__list');
  var swiperContainer = document.querySelector('.about-life__swiper');

  var swiperActivation = function () {
    swiperContainer.classList.add('swiper-container');
    swiperWrapper.classList.add('swiper-wrapper');
    slideDescriptions.forEach(function (it) {
      it.classList.add('swiper-slide');
    });
    var swiper = new Swiper('.swiper-container', {
      pagination: {
        el: '.swiper-pagination',
      },
    });
  };

  var swiperDeactivation = function () {
    swiperContainer.classList.remove('swiper-container');
    swiperWrapper.classList.remove('swiper-wrapper');
    slideDescriptions.forEach(function (it) {
      it.classList.remove('swiper-slide');
    })
  };

  if (window.matchMedia("(max-width: 767px)").matches) {
    swiperActivation()
  }

  var displaySizeHandler = function () {
    if (window.innerWidth <= 767) {
      swiperActivation()
    } else if (window.innerWidth >= 768) {
      swiperDeactivation()
    }
  };

  window.addEventListener('resize', displaySizeHandler);
})();
