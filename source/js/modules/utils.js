'use strict';

(function () {
  var ESC_KEY = 'Escape';
  var BACKSPACE_KEY = 'Backspace';
  var DELETE_KEY = 'Delete';
  var TEL_PATTERN = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;

  var changeItem = function (arr, i, activeClass) {
    arr.forEach(function (item) {
      item.classList.remove(activeClass);
    });
    arr[i].classList.add(activeClass);
  };

  window.utils = {
    ESC_KEY: ESC_KEY,
    BACKSPACE_KEY: BACKSPACE_KEY,
    DELETE_KEY: DELETE_KEY,
    TEL_PATTERN: TEL_PATTERN,
    changeItem: changeItem
  }
})();
