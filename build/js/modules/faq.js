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
