'use strict';

(function () {
  // var swiper = new Swiper('.swiper-container');
  // console.log(swiper);

  var slideDotButtons = document.querySelectorAll('.about-life__item-counter');
  var slideDescriptions = document.querySelectorAll('.about-life__item');
  var swiperWrapper = document.querySelector('.about-life__list');
  var swiperContainer = document.querySelector('.about-life__swiper');

  // slideDotButtons.forEach(function (button, i) {
  //   button.addEventListener('click', function () {
  //     window.utils.changeItem(slideDotButtons, i, 'about-life__item-counter--active');
  //     window.utils.changeItem(slideDescriptions, i, 'about-life__item--active');
  //   });
  // });

  var displaySizeHandler = function () {
    if (window.innerWidth <= 767) {
      var swiper = new Swiper('.swiper-container', {
        pagination: {
          el: '.swiper-pagination',
        },
      });
      swiperContainer.classList.add('swiper-container');
      swiperWrapper.classList.add('swiper-wrapper');
      slideDescriptions.forEach(function (it) {
        it.classList.add('swiper-slide');
      });
    } else if (window.innerWidth >= 768) {
      window.addEventListener('resize', displaySizeHandler);
      swiperContainer.classList.remove('swiper-container');
      swiperWrapper.classList.remove('swiper-wrapper');
      slideDescriptions.forEach(function (it) {
        it.classList.remove('swiper-slide');
      })
    }
  };

  window.addEventListener('resize', displaySizeHandler);
})();
