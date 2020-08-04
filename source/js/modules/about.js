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
