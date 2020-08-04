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

  // if (window.innerWidth <= 767) {
  //   var swiper = new Swiper('.swiper-container', {
  //     direction: 'vertical',
  //     loop: true,
  //
  //     // If we need pagination
  //     pagination: {
  //       el: '.swiper-pagination',
  //     },
  //   });
  //
  //   programSwiperContainer.classList.add('swiper-container');
  //   programSwiperWrapper.classList.add('swiper-wrapper');
  //
  //   programTypeButton.forEach(function (it) {
  //     it.classList.add('swiper-slide');
  //   });
  // }

})();
