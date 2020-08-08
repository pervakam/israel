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

})();
