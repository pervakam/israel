'use strict';

(function () {
  var slideDotButtons = document.querySelectorAll('.about-life__item-counter');
  var slideDescriptions = document.querySelectorAll('.about-life__item');

  slideDotButtons.forEach(function (button, i) {
    button.addEventListener('click', function () {
      window.utils.changeItem(slideDotButtons, i, 'about-life__item-counter--active');
      window.utils.changeItem(slideDescriptions, i, 'about-life__item--active');
    });
  });
})();
