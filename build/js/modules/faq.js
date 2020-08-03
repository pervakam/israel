'use strict';

(function () {
  var answerOpenButton = document.querySelectorAll('.faq__item-question--hide');
  var answerHide = document.querySelector('.faq__item-answer--hide');
  var answerText = document.querySelectorAll('.faq__item-answer');
  var activeAnswerText = document.querySelectorAll('.faq__item-answer--active');

  if (!answerHide) {
    answerText.forEach(function (it) {
      it.classList.add('faq__item-answer--hide');
    });
  }

  var showAnswer = function (arr, i, activeClass,) {
    // arr.forEach(function (item) {
    //   item.classList.remove(activeClass);
    // });

    arr[i].classList.toggle(activeClass);

  };

  answerOpenButton.forEach(function (button, i) {
    button.addEventListener('click', function () {

      showAnswer(answerOpenButton, i, 'faq__item-question--active');
      showAnswer(answerText, i, 'faq__item-answer--active');
    });
  });
})();
