'use strict';

(function () {
  var PROGRAM_NAME_MOB_WIDTH = '90vw';
  var PROGRAM_NAME_DESK_WIDTH = '229px';

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
    var swiper = new Swiper('.swiper-container', {
      slidesPerView: 'auto',
    });
    programSwiperWrapper.style.width = PROGRAM_NAME_MOB_WIDTH;
  };

  var swiperDeactivation = function () {
    programSwiperContainer.classList.remove('swiper-container');
    programSwiperWrapper.classList.remove('swiper-wrapper');
    programTypeButton.forEach(function (it) {
      it.classList.remove('swiper-slide');
    })
    programSwiperWrapper.style.width = PROGRAM_NAME_DESK_WIDTH;
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
