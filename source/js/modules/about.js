'use strict';

(function () {
  var slideDescriptions = document.querySelectorAll('.about-life__item');
  var swiperWrapper = document.querySelector('.about-life__list');
  var swiperContainer = document.querySelector('.about-life__swiper');

    swiperContainer.classList.add('swiper-container');
    swiperWrapper.classList.add('swiper-wrapper');


  var aboutLifeSwiper = new Swiper('.swiper-container', {
    init: false,
    pagination: {
      el: '.swiper-pagination',
    },
    spaceBetween: 30,
    watchOverflow: true,
  });

  var swiperActivation = function () {
    swiperWrapper.classList.add('swiper-wrapper');
    slideDescriptions.forEach(function (it) {
      it.classList.add('swiper-slide');
    });
    aboutLifeSwiper.init(true);
  };

  var swiperDeactivation = function () {
    swiperContainer.classList.remove('swiper-container');
    swiperWrapper.classList.remove('swiper-wrapper');
    slideDescriptions.forEach(function (it) {
      it.classList.remove('swiper-slide');
    });
    aboutLifeSwiper.update();
  };

  if (window.matchMedia('(max-width: 767px)').matches) {
    swiperActivation();
  }

  var displaySizeHandler = function () {
    if (window.matchMedia('(max-width: 767px)').matches) {

      swiperActivation();
    } else if (window.matchMedia('(min-width: 768px)').matches) {
        swiperDeactivation();
    } else {}
  };

  window.addEventListener('resize', displaySizeHandler);

})();
