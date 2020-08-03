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
