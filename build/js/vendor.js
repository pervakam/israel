/*!
 * Swipe 2.2.18
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

// if the module has no dependencies, the above pattern can be simplified to
// eslint-disable-next-line no-extra-semi
;(function (root, factory) {
  root = root || {};
  // eslint-disable-next-line no-undef
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    // eslint-disable-next-line no-undef
    define([], function(){
      root.Swipe = factory();
      return root.Swipe;
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals
    root.Swipe = factory();
  }
}(this, function () {
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this;

  var _document = root.document;

  function Swipe(container, options) {

    'use strict';

    options = options || {};

    // setup initial vars
    var start = {};
    var delta = {};
    var isScrolling;

    // setup auto slideshow
    var delay = options.auto || 0;
    var interval;

    var disabled = false;

    // utilities
    // simple no operation function
    var noop = function() {};
    // offload a functions execution
    var offloadFn = function(fn) { setTimeout(fn || noop, 0); };
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered.
    var throttle = function (fn, threshhold) {
      threshhold = threshhold || 100;
      var timeout = null;

      function cancel() {
        if (timeout) clearTimeout(timeout);
      }

      function throttledFn() {
        var context = this;
        var args = arguments;
        cancel();
        timeout = setTimeout(function() {
          timeout = null;
          fn.apply(context, args);
        }, threshhold);
      }

      // allow remove throttled timeout
      throttledFn.cancel = cancel;

      return throttledFn;
    };

    // check whether event is cancelable
    var isCancelable = function (event) {
      if (!event) return false;
      return typeof event.cancelable !== 'boolean' || event.cancelable;
    };

    // polyfill for browsers that do not support Element.matches()
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
          while (--i >= 0 && matches.item(i) !== this)
            ;
          return i > -1;
        };
    }

    // check browser capabilities
    var browser = {
      addEventListener: !!root.addEventListener,
      passiveEvents: (function () {
        // Test via a getter in the options object to see if the passive property is accessed
        var supportsPassive = false;
        try {
          var opts = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line getter-return
            get: function () {
              supportsPassive = true;
            }
          });
          root.addEventListener('testEvent', null, opts);
          root.removeEventListener('testEvent', null, opts);
        }
        catch (e) {
          supportsPassive = false;
        }
        return supportsPassive;
      })(),
      // eslint-disable-next-line no-undef
      touch: ('ontouchstart' in root) || root.DocumentTouch && _document instanceof DocumentTouch,
      transitions: (function(temp) {
        var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
        for ( var i in props ) {
          if (temp.style[ props[i] ] !== undefined){
            return true;
          }
        }
        return false;
      })(_document.createElement('swipe'))
    };

    // quit if no root element
    if (!container) return;

    var element = container.children[0];
    var slides, slidePos, width, length;
    var index = parseInt(options.startSlide, 10) || 0;
    var speed = options.speed || 300;
    options.continuous = options.continuous !== undefined ? options.continuous : true;

    // check text direction
    var slideDir = (function(el, prop, dir) {
      if (el.currentStyle) {
        dir = el.currentStyle[prop];
      } else if (root.getComputedStyle) {
        dir = root.getComputedStyle(el, null).getPropertyValue(prop);
      }
      return 'rtl' === dir ? 'right' : 'left';
    })(container, 'direction');

    // AutoRestart option: auto restart slideshow after user's touch event
    options.autoRestart = options.autoRestart !== undefined ? options.autoRestart : false;

    // throttled setup
    var throttledSetup = throttle(setup);

    // setup event capturing
    var events = {

      handleEvent: function(event) {
        if (disabled) return;

        switch (event.type) {
          case 'mousedown':
          case 'touchstart': this.start(event); break;
          case 'mousemove':
          case 'touchmove': this.move(event); break;
          case 'mouseup':
          case 'mouseleave':
          case 'touchend': this.end(event); break;
          case 'webkitTransitionEnd':
          case 'msTransitionEnd':
          case 'oTransitionEnd':
          case 'otransitionend':
          case 'transitionend': this.transitionEnd(event); break;
          case 'resize': throttledSetup(); break;
        }

        if (options.stopPropagation) {
          event.stopPropagation();
        }
      },

      start: function(event) {
        var touches;

        if (isMouseEvent(event)) {
          touches = event;
          event.preventDefault(); // For desktop Safari drag
        } else {
          touches = event.touches[0];
        }

        // check if the user is swiping on an element that the options say to ignore (for example, a scrolling area)
        if (options.ignore && touches.target.matches(options.ignore)) {
          return;
        }

        // measure start values
        start = {

          // get initial touch coords
          x: touches.pageX,
          y: touches.pageY,

          // store time to determine touch duration
          time: +new Date()

        };

        // used for testing first move event
        isScrolling = undefined;

        // reset delta and end measurements
        delta = {};

        // attach touchmove and touchend listeners
        if (isMouseEvent(event)) {
          element.addEventListener('mousemove', this, false);
          element.addEventListener('mouseup', this, false);
          element.addEventListener('mouseleave', this, false);
        } else {
          element.addEventListener('touchmove', this, browser.passiveEvents ? { passive: false } : false);
          element.addEventListener('touchend', this, false);
        }
        runDragStart(getPos(), slides[index]);
      },

      move: function(event) {
        var touches;

        if (isMouseEvent(event)) {
          touches = event;
        } else {
          // ensure swiping with one touch and not pinching
          if ( event.touches.length > 1 || event.scale && event.scale !== 1) {
            return;
          }

          // we can disable scrolling unless it is already in progress
          if (options.disableScroll && isCancelable(event)) {
            event.preventDefault();
          }

          touches = event.touches[0];
        }

        // measure change in x and y
        delta = {
          x: touches.pageX - start.x,
          y: touches.pageY - start.y
        };

        // determine if scrolling test has run - one time test
        if ( typeof isScrolling === 'undefined') {
          isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
        }

        // if user is not trying to scroll vertically
        if (!isScrolling) {

          // if it is not already scrolling
          if (isCancelable(event)) {
            // prevent native scrolling
            event.preventDefault();
          }

          // stop slideshow
          stop();

          // increase resistance if first or last slide
          if (options.continuous) { // we don't add resistance at the end

            translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

          } else {

            delta.x =
              delta.x /
              ( (!index && delta.x > 0 ||             // if first slide and sliding left
                index === slides.length - 1 &&        // or if last slide and sliding right
                delta.x < 0                           // and if sliding at all
              ) ?
                ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                : 1 );                                 // no resistance if false

            // translate 1:1
            translate(index-1, delta.x + slidePos[index-1], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(index+1, delta.x + slidePos[index+1], 0);
          }
        }
      },

      end: function(event) {

        // measure duration
        var duration = +new Date() - start.time;

        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
          Number(duration) < 250 &&         // if slide duration is less than 250ms
          Math.abs(delta.x) > 20 ||         // and if slide amt is greater than 20px
          Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

        // determine if slide attempt is past start and end
        var isPastBounds =
          !index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
          index === slides.length - 1 && delta.x < 0;   // or if last slide and slide amt is less than 0

        if (options.continuous) {
          isPastBounds = false;
        }

        // OLD determine direction of swipe (true:right, false:left)
        // determine direction of swipe (1: backward, -1: forward)
        var direction = Math.abs(delta.x) / delta.x;

        // if not scrolling vertically
        if (!isScrolling) {

          if (isValidSlide && !isPastBounds) {

            // if we're moving right
            if (direction < 0) {

              if (options.continuous) { // we need to get the next in this direction in place

                move(circle(index-1), -width, 0);
                move(circle(index+2), width, 0);

              } else {
                move(index-1, -width, 0);
              }

              move(index, slidePos[index]-width, speed);
              move(circle(index+1), slidePos[circle(index+1)]-width, speed);
              index = circle(index+1);

            } else {
              if (options.continuous) { // we need to get the next in this direction in place

                move(circle(index+1), width, 0);
                move(circle(index-2), -width, 0);

              } else {
                move(index+1, width, 0);
              }

              move(index, slidePos[index]+width, speed);
              move(circle(index-1), slidePos[circle(index-1)]+width, speed);
              index = circle(index-1);
            }

            runCallback(getPos(), slides[index], direction);

          } else {

            if (options.continuous) {

              move(circle(index-1), -width, speed);
              move(index, 0, speed);
              move(circle(index+1), width, speed);

            } else {

              move(index-1, -width, speed);
              move(index, 0, speed);
              move(index+1, width, speed);
            }
          }
        }

        // kill touchmove and touchend event listeners until touchstart called again
        if (isMouseEvent(event)) {
          element.removeEventListener('mousemove', events, false);
          element.removeEventListener('mouseup', events, false);
          element.removeEventListener('mouseleave', events, false);
        } else {
          element.removeEventListener('touchmove', events, browser.passiveEvents ? { passive: false } : false);
          element.removeEventListener('touchend', events, false);
        }
        runDragEnd(getPos(), slides[index]);
      },

      transitionEnd: function(event) {
        var currentIndex = parseInt(event.target.getAttribute('data-index'), 10);
        if (currentIndex === index) {
          if (delay || options.autoRestart) restart();

          runTransitionEnd(getPos(), slides[index]);
        }
      }
    };

    // trigger setup
    setup();

    // start auto slideshow if applicable
    begin();

    // Expose the Swipe API
    return {
      // initialize
      setup: setup,

      // go to slide
      slide: function(to, speed) {
        stop();
        slide(to, speed);
      },

      // move to previous
      prev: function() {
        stop();
        prev();
      },

      // move to next
      next: function() {
        stop();
        next();
      },

      // Restart slideshow
      restart: restart,

      // cancel slideshow
      stop: stop,

      // return current index position
      getPos: getPos,

      // disable slideshow
      disable: disable,

      // enable slideshow
      enable: enable,

      // return total number of slides
      getNumSlides: function() { return length; },

      // completely remove swipe
      kill: kill
    };

    // remove all event listeners
    function detachEvents() {
      if (browser.addEventListener) {
        // remove current event listeners
        element.removeEventListener('touchstart', events, browser.passiveEvents ? { passive: true } : false);
        element.removeEventListener('mousedown', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        root.removeEventListener('resize', events, false);
      } else {
        root.onresize = null;
      }
    }

    // add event listeners
    function attachEvents() {
      if (browser.addEventListener) {

        // set touchstart event on element
        if (browser.touch) {
          element.addEventListener('touchstart', events, browser.passiveEvents ? { passive: true } : false);
        }

        if (options.draggable) {
          element.addEventListener('mousedown', events, false);
        }

        if (browser.transitions) {
          element.addEventListener('webkitTransitionEnd', events, false);
          element.addEventListener('msTransitionEnd', events, false);
          element.addEventListener('oTransitionEnd', events, false);
          element.addEventListener('otransitionend', events, false);
          element.addEventListener('transitionend', events, false);
        }

        // set resize event on window
        root.addEventListener('resize', events, false);

      } else {
        root.onresize = throttledSetup; // to play nice with old IE
      }
    }

    // clone nodes when there is only two slides
    function cloneNode(el) {
      var clone = el.cloneNode(true);
      element.appendChild(clone);

      // tag these slides as clones (to remove them on kill)
      clone.setAttribute('data-cloned', true);

      // Remove id from element
      clone.removeAttribute('id');
    }

    function setup(opts) {
      // Overwrite options if necessary
      if (opts != null) {
        for (var prop in opts) {
          options[prop] = opts[prop];
        }
      }

      // cache slides
      slides = element.children;
      length = slides.length;

      // slides length correction, minus cloned slides
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].getAttribute('data-cloned')) length--;
      }

      // set continuous to false if only one slide
      if (slides.length < 2) {
        options.continuous = false;
      }

      // special case if two slides
      if (browser.transitions && options.continuous && slides.length < 3) {
        cloneNode(slides[0]);
        cloneNode(slides[1]);

        slides = element.children;
      }

      // adjust style on rtl
      if ('right' === slideDir) {
        for (var j = 0; j < slides.length; j++) {
          slides[j].style.float = 'right';
        }
      }

      // create an array to store current positions of each slide
      slidePos = new Array(slides.length);

      // determine width of each slide
      width = container.getBoundingClientRect().width || container.offsetWidth;

      element.style.width = (slides.length * width * 2) + 'px';

      // stack elements
      var pos = slides.length;
      while(pos--) {
        var slide = slides[pos];

        slide.style.width = width + 'px';
        slide.setAttribute('data-index', pos);

        if (browser.transitions) {
          slide.style[slideDir] = (pos * -width) + 'px';
          move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
        }
      }

      // reposition elements before and after index
      if (options.continuous && browser.transitions) {
        move(circle(index-1), -width, 0);
        move(circle(index+1), width, 0);
      }

      if (!browser.transitions) {
        element.style[slideDir] = (index * -width) + 'px';
      }

      container.style.visibility = 'visible';

      // reinitialize events
      detachEvents();
      attachEvents();
    }

    function prev() {
      if (disabled) return;

      if (options.continuous) {
        slide(index-1);
      } else if (index) {
        slide(index-1);
      }
    }

    function next() {
      if (disabled) return;

      if (options.continuous) {
        slide(index+1);
      } else if (index < slides.length - 1) {
        slide(index+1);
      }
    }

    function runCallback(pos, index, dir) {
      if (options.callback) {
        options.callback(pos, index, dir);
      }
    }

    function runTransitionEnd(pos, index) {
      if (options.transitionEnd) {
        options.transitionEnd(pos, index);
      }
    }

    function runDragStart(pos, index) {
      if (options.dragStart) {
        options.dragStart(pos, index);
      }
    }

    function runDragEnd(pos, index) {
      if (options.dragEnd) {
        options.dragEnd(pos, index);
      }
    }

    function circle(index) {

      // a simple positive modulo using slides.length
      return (slides.length + (index % slides.length)) % slides.length;
    }

    function getPos() {
      // Fix for the clone issue in the event of 2 slides
      var currentIndex = index;

      if (currentIndex >= length) {
        currentIndex = currentIndex - length;
      }

      return currentIndex;
    }

    function slide(to, slideSpeed) {

      // ensure to is of type 'number'
      to = typeof to !== 'number' ? parseInt(to, 10) : to;

      // do nothing if already on requested slide
      if (index === to) return;

      if (browser.transitions) {

        var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

        // get the actual position of the slide
        if (options.continuous) {
          var natural_direction = direction;
          direction = -slidePos[circle(to)] / width;

          // if going forward but to < index, use to = slides.length + to
          // if going backward but to > index, use to = -slides.length + to
          if (direction !== natural_direction) {
            to = -direction * slides.length + to;
          }

        }

        var diff = Math.abs(index-to) - 1;

        // move all the slides between index and to in the right direction
        while (diff--) {
          move( circle((to > index ? to : index) - diff - 1), width * direction, 0);
        }

        to = circle(to);

        move(index, width * direction, slideSpeed || speed);
        move(to, 0, slideSpeed || speed);

        if (options.continuous) { // we need to get the next in place
          move(circle(to - direction), -(width * direction), 0);
        }

      } else {

        to = circle(to);
        animate(index * -width, to * -width, slideSpeed || speed);
        // no fallback for a circular continuous if the browser does not accept transitions
      }

      index = to;
      offloadFn(function() {
        runCallback(getPos(), slides[index], direction);
      });
    }

    function move(index, dist, speed) {
      translate(index, dist, speed);
      slidePos[index] = dist;
    }

    function translate(index, dist, speed) {

      var slide = slides[index];
      var style = slide && slide.style;

      if (!style) return;

      style.webkitTransitionDuration =
        style.MozTransitionDuration =
          style.msTransitionDuration =
            style.OTransitionDuration =
              style.transitionDuration = speed + 'ms';

      style.webkitTransform =
        style.msTransform =
          style.MozTransform =
            style.OTransform =
              style.transform = 'translateX(' + dist + 'px)';
    }

    function animate(from, to, speed) {

      // if not an animation, just reposition
      if (!speed) {
        element.style[slideDir] = to + 'px';
        return;
      }

      var start = +new Date();

      var timer = setInterval(function() {
        var timeElap = +new Date() - start;

        if (timeElap > speed) {

          element.style[slideDir] = to + 'px';

          if (delay || options.autoRestart) restart();

          runTransitionEnd(getPos(), slides[index]);

          clearInterval(timer);

          return;
        }

        element.style[slideDir] = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
      }, 4);

    }

    function begin() {
      delay = options.auto || 0;
      if (delay) interval = setTimeout(next, delay);
    }

    function stop() {
      delay = 0;
      clearTimeout(interval);
    }

    function restart() {
      stop();
      begin();
    }

    function disable() {
      stop();
      disabled = true;
    }

    function enable() {
      disabled = false;
      restart();
    }

    function isMouseEvent(e) {
      return /^mouse/.test(e.type);
    }

    function kill() {
      // cancel slideshow
      stop();

      // remove inline styles
      container.style.visibility = '';

      // reset element
      element.style.width = '';
      element.style[slideDir] = '';

      // reset slides
      var pos = slides.length;
      while (pos--) {

        if (browser.transitions) {
          translate(pos, 0, 0);
        }

        var slide = slides[pos];

        // if the slide is tagged as clone, remove it
        if (slide.getAttribute('data-cloned')) {
          var _parent = slide.parentElement;
          _parent.removeChild(slide);
        }

        // remove styles
        slide.style.width = '';
        slide.style[slideDir] = '';

        slide.style.webkitTransitionDuration =
          slide.style.MozTransitionDuration =
            slide.style.msTransitionDuration =
              slide.style.OTransitionDuration =
                slide.style.transitionDuration = '';

        slide.style.webkitTransform =
          slide.style.msTransform =
            slide.style.MozTransform =
              slide.style.OTransform = '';

        // remove custom attributes (?)
        // slide.removeAttribute('data-index');
      }

      // remove all events
      detachEvents();

      // remove throttled function timeout
      throttledSetup.cancel();
    }
  }

  if ( root.jQuery || root.Zepto ) {
    (function($) {
      $.fn.Swipe = function(params) {
        return this.each(function() {
          $(this).data('Swipe', new Swipe($(this)[0], params));
        });
      };
    })( root.jQuery || root.Zepto );
  }

  return Swipe;
}));

/*! picturefill - v3.0.2 - 2016-02-12
 * https://scottjehl.github.io/picturefill/
 * Copyright (c) 2016 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT
 */
/*! Gecko-Picture - v1.0
 * https://github.com/scottjehl/picturefill/tree/3.0/src/plugins/gecko-picture
 * Firefox's early picture implementation (prior to FF41) is static and does
 * not react to viewport changes. This tiny module fixes this.
 */
(function(window) {
  /*jshint eqnull:true */
  var ua = navigator.userAgent;

  if ( window.HTMLPictureElement && ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 < 45) ) {
    addEventListener("resize", (function() {
      var timer;

      var dummySrc = document.createElement("source");

      var fixRespimg = function(img) {
        var source, sizes;
        var picture = img.parentNode;

        if (picture.nodeName.toUpperCase() === "PICTURE") {
          source = dummySrc.cloneNode();

          picture.insertBefore(source, picture.firstElementChild);
          setTimeout(function() {
            picture.removeChild(source);
          });
        } else if (!img._pfLastSize || img.offsetWidth > img._pfLastSize) {
          img._pfLastSize = img.offsetWidth;
          sizes = img.sizes;
          img.sizes += ",100vw";
          setTimeout(function() {
            img.sizes = sizes;
          });
        }
      };

      var findPictureImgs = function() {
        var i;
        var imgs = document.querySelectorAll("picture > img, img[srcset][sizes]");
        for (i = 0; i < imgs.length; i++) {
          fixRespimg(imgs[i]);
        }
      };
      var onResize = function() {
        clearTimeout(timer);
        timer = setTimeout(findPictureImgs, 99);
      };
      var mq = window.matchMedia && matchMedia("(orientation: landscape)");
      var init = function() {
        onResize();

        if (mq && mq.addListener) {
          mq.addListener(onResize);
        }
      };

      dummySrc.srcset = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

      if (/^[c|i]|d$/.test(document.readyState || "")) {
        init();
      } else {
        document.addEventListener("DOMContentLoaded", init);
      }

      return onResize;
    })());
  }
})(window);

/*! Picturefill - v3.0.2
 * http://scottjehl.github.io/picturefill
 * Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt;
 *  License: MIT
 */

(function( window, document, undefined ) {
  // Enable strict mode
  "use strict";

  // HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
  document.createElement( "picture" );

  var warn, eminpx, alwaysCheckWDescriptor, evalId;
  // local object for method references and testing exposure
  var pf = {};
  var isSupportTestReady = false;
  var noop = function() {};
  var image = document.createElement( "img" );
  var getImgAttr = image.getAttribute;
  var setImgAttr = image.setAttribute;
  var removeImgAttr = image.removeAttribute;
  var docElem = document.documentElement;
  var types = {};
  var cfg = {
    //resource selection:
    algorithm: ""
  };
  var srcAttr = "data-pfsrc";
  var srcsetAttr = srcAttr + "set";
  // ua sniffing is done for undetectable img loading features,
  // to do some non crucial perf optimizations
  var ua = navigator.userAgent;
  var supportAbort = (/rident/).test(ua) || ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 > 35 );
  var curSrcProp = "currentSrc";
  var regWDesc = /\s+\+?\d+(e\d+)?w/;
  var regSize = /(\([^)]+\))?\s*(.+)/;
  var setOptions = window.picturefillCFG;
  /**
   * Shortcut property for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
   */
    // baseStyle also used by getEmValue (i.e.: width: 1em is important)
  var baseStyle = "position:absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;overflow:hidden;clip:rect(0px, 0px, 0px, 0px)";
  var fsCss = "font-size:100%!important;";
  var isVwDirty = true;

  var cssCache = {};
  var sizeLengthCache = {};
  var DPR = window.devicePixelRatio;
  var units = {
    px: 1,
    "in": 96
  };
  var anchor = document.createElement( "a" );
  /**
   * alreadyRun flag used for setOptions. is it true setOptions will reevaluate
   * @type {boolean}
   */
  var alreadyRun = false;

  // Reusable, non-"g" Regexes

  // (Don't use \s, to avoid matching non-breaking space.)
  var regexLeadingSpaces = /^[ \t\n\r\u000c]+/,
    regexLeadingCommasOrSpaces = /^[, \t\n\r\u000c]+/,
    regexLeadingNotSpaces = /^[^ \t\n\r\u000c]+/,
    regexTrailingCommas = /[,]+$/,
    regexNonNegativeInteger = /^\d+$/,

    // ( Positive or negative or unsigned integers or decimals, without or without exponents.
    // Must include at least one digit.
    // According to spec tests any decimal point must be followed by a digit.
    // No leading plus sign is allowed.)
    // https://html.spec.whatwg.org/multipage/infrastructure.html#valid-floating-point-number
    regexFloatingPoint = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;

  var on = function(obj, evt, fn, capture) {
    if ( obj.addEventListener ) {
      obj.addEventListener(evt, fn, capture || false);
    } else if ( obj.attachEvent ) {
      obj.attachEvent( "on" + evt, fn);
    }
  };

  /**
   * simple memoize function:
   */

  var memoize = function(fn) {
    var cache = {};
    return function(input) {
      if ( !(input in cache) ) {
        cache[ input ] = fn(input);
      }
      return cache[ input ];
    };
  };

  // UTILITY FUNCTIONS

  // Manual is faster than RegEx
  // http://jsperf.com/whitespace-character/5
  function isSpace(c) {
    return (c === "\u0020" || // space
      c === "\u0009" || // horizontal tab
      c === "\u000A" || // new line
      c === "\u000C" || // form feed
      c === "\u000D");  // carriage return
  }

  /**
   * gets a mediaquery and returns a boolean or gets a css length and returns a number
   * @param css mediaqueries or css length
   * @returns {boolean|number}
   *
   * based on: https://gist.github.com/jonathantneal/db4f77009b155f083738
   */
  var evalCSS = (function() {

    var regLength = /^([\d\.]+)(em|vw|px)$/;
    var replace = function() {
      var args = arguments, index = 0, string = args[0];
      while (++index in args) {
        string = string.replace(args[index], args[++index]);
      }
      return string;
    };

    var buildStr = memoize(function(css) {

      return "return " + replace((css || "").toLowerCase(),
        // interpret `and`
        /\band\b/g, "&&",

        // interpret `,`
        /,/g, "||",

        // interpret `min-` as >=
        /min-([a-z-\s]+):/g, "e.$1>=",

        // interpret `max-` as <=
        /max-([a-z-\s]+):/g, "e.$1<=",

        //calc value
        /calc([^)]+)/g, "($1)",

        // interpret css values
        /(\d+[\.]*[\d]*)([a-z]+)/g, "($1 * e.$2)",
        //make eval less evil
        /^(?!(e.[a-z]|[0-9\.&=|><\+\-\*\(\)\/])).*/ig, ""
      ) + ";";
    });

    return function(css, length) {
      var parsedLength;
      if (!(css in cssCache)) {
        cssCache[css] = false;
        if (length && (parsedLength = css.match( regLength ))) {
          cssCache[css] = parsedLength[ 1 ] * units[parsedLength[ 2 ]];
        } else {
          /*jshint evil:true */
          try{
            cssCache[css] = new Function("e", buildStr(css))(units);
          } catch(e) {}
          /*jshint evil:false */
        }
      }
      return cssCache[css];
    };
  })();

  var setResolution = function( candidate, sizesattr ) {
    if ( candidate.w ) { // h = means height: || descriptor.type === 'h' do not handle yet...
      candidate.cWidth = pf.calcListLength( sizesattr || "100vw" );
      candidate.res = candidate.w / candidate.cWidth ;
    } else {
      candidate.res = candidate.d;
    }
    return candidate;
  };

  /**
   *
   * @param opt
   */
  var picturefill = function( opt ) {

    if (!isSupportTestReady) {return;}

    var elements, i, plen;

    var options = opt || {};

    if ( options.elements && options.elements.nodeType === 1 ) {
      if ( options.elements.nodeName.toUpperCase() === "IMG" ) {
        options.elements =  [ options.elements ];
      } else {
        options.context = options.elements;
        options.elements =  null;
      }
    }

    elements = options.elements || pf.qsa( (options.context || document), ( options.reevaluate || options.reselect ) ? pf.sel : pf.selShort );

    if ( (plen = elements.length) ) {

      pf.setupRun( options );
      alreadyRun = true;

      // Loop through all elements
      for ( i = 0; i < plen; i++ ) {
        pf.fillImg(elements[ i ], options);
      }

      pf.teardownRun( options );
    }
  };

  /**
   * outputs a warning for the developer
   * @param {message}
   * @type {Function}
   */
  warn = ( window.console && console.warn ) ?
    function( message ) {
      console.warn( message );
    } :
    noop
  ;

  if ( !(curSrcProp in image) ) {
    curSrcProp = "src";
  }

  // Add support for standard mime types.
  types[ "image/jpeg" ] = true;
  types[ "image/gif" ] = true;
  types[ "image/png" ] = true;

  function detectTypeSupport( type, typeUri ) {
    // based on Modernizr's lossless img-webp test
    // note: asynchronous
    var image = new window.Image();
    image.onerror = function() {
      types[ type ] = false;
      picturefill();
    };
    image.onload = function() {
      types[ type ] = image.width === 1;
      picturefill();
    };
    image.src = typeUri;
    return "pending";
  }

  // test svg support
  types[ "image/svg+xml" ] = document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#Image", "1.1" );

  /**
   * updates the internal vW property with the current viewport width in px
   */
  function updateMetrics() {

    isVwDirty = false;
    DPR = window.devicePixelRatio;
    cssCache = {};
    sizeLengthCache = {};

    pf.DPR = DPR || 1;

    units.width = Math.max(window.innerWidth || 0, docElem.clientWidth);
    units.height = Math.max(window.innerHeight || 0, docElem.clientHeight);

    units.vw = units.width / 100;
    units.vh = units.height / 100;

    evalId = [ units.height, units.width, DPR ].join("-");

    units.em = pf.getEmValue();
    units.rem = units.em;
  }

  function chooseLowRes( lowerValue, higherValue, dprValue, isCached ) {
    var bonusFactor, tooMuch, bonus, meanDensity;

    //experimental
    if (cfg.algorithm === "saveData" ){
      if ( lowerValue > 2.7 ) {
        meanDensity = dprValue + 1;
      } else {
        tooMuch = higherValue - dprValue;
        bonusFactor = Math.pow(lowerValue - 0.6, 1.5);

        bonus = tooMuch * bonusFactor;

        if (isCached) {
          bonus += 0.1 * bonusFactor;
        }

        meanDensity = lowerValue + bonus;
      }
    } else {
      meanDensity = (dprValue > 1) ?
        Math.sqrt(lowerValue * higherValue) :
        lowerValue;
    }

    return meanDensity > dprValue;
  }

  function applyBestCandidate( img ) {
    var srcSetCandidates;
    var matchingSet = pf.getSet( img );
    var evaluated = false;
    if ( matchingSet !== "pending" ) {
      evaluated = evalId;
      if ( matchingSet ) {
        srcSetCandidates = pf.setRes( matchingSet );
        pf.applySetCandidate( srcSetCandidates, img );
      }
    }
    img[ pf.ns ].evaled = evaluated;
  }

  function ascendingSort( a, b ) {
    return a.res - b.res;
  }

  function setSrcToCur( img, src, set ) {
    var candidate;
    if ( !set && src ) {
      set = img[ pf.ns ].sets;
      set = set && set[set.length - 1];
    }

    candidate = getCandidateForSrc(src, set);

    if ( candidate ) {
      src = pf.makeUrl(src);
      img[ pf.ns ].curSrc = src;
      img[ pf.ns ].curCan = candidate;

      if ( !candidate.res ) {
        setResolution( candidate, candidate.set.sizes );
      }
    }
    return candidate;
  }

  function getCandidateForSrc( src, set ) {
    var i, candidate, candidates;
    if ( src && set ) {
      candidates = pf.parseSet( set );
      src = pf.makeUrl(src);
      for ( i = 0; i < candidates.length; i++ ) {
        if ( src === pf.makeUrl(candidates[ i ].url) ) {
          candidate = candidates[ i ];
          break;
        }
      }
    }
    return candidate;
  }

  function getAllSourceElements( picture, candidates ) {
    var i, len, source, srcset;

    // SPEC mismatch intended for size and perf:
    // actually only source elements preceding the img should be used
    // also note: don't use qsa here, because IE8 sometimes doesn't like source as the key part in a selector
    var sources = picture.getElementsByTagName( "source" );

    for ( i = 0, len = sources.length; i < len; i++ ) {
      source = sources[ i ];
      source[ pf.ns ] = true;
      srcset = source.getAttribute( "srcset" );

      // if source does not have a srcset attribute, skip
      if ( srcset ) {
        candidates.push( {
          srcset: srcset,
          media: source.getAttribute( "media" ),
          type: source.getAttribute( "type" ),
          sizes: source.getAttribute( "sizes" )
        } );
      }
    }
  }

  /**
   * Srcset Parser
   * By Alex Bell |  MIT License
   *
   * @returns Array [{url: _, d: _, w: _, h:_, set:_(????)}, ...]
   *
   * Based super duper closely on the reference algorithm at:
   * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-srcset-attribute
   */

  // 1. Let input be the value passed to this algorithm.
  // (TO-DO : Explain what "set" argument is here. Maybe choose a more
  // descriptive & more searchable name.  Since passing the "set" in really has
  // nothing to do with parsing proper, I would prefer this assignment eventually
  // go in an external fn.)
  function parseSrcset(input, set) {

    function collectCharacters(regEx) {
      var chars,
        match = regEx.exec(input.substring(pos));
      if (match) {
        chars = match[ 0 ];
        pos += chars.length;
        return chars;
      }
    }

    var inputLength = input.length,
      url,
      descriptors,
      currentDescriptor,
      state,
      c,

      // 2. Let position be a pointer into input, initially pointing at the start
      //    of the string.
      pos = 0,

      // 3. Let candidates be an initially empty source set.
      candidates = [];

    /**
     * Adds descriptor properties to a candidate, pushes to the candidates array
     * @return undefined
     */
    // (Declared outside of the while loop so that it's only created once.
    // (This fn is defined before it is used, in order to pass JSHINT.
    // Unfortunately this breaks the sequencing of the spec comments. :/ )
    function parseDescriptors() {

      // 9. Descriptor parser: Let error be no.
      var pError = false,

        // 10. Let width be absent.
        // 11. Let density be absent.
        // 12. Let future-compat-h be absent. (We're implementing it now as h)
        w, d, h, i,
        candidate = {},
        desc, lastChar, value, intVal, floatVal;

      // 13. For each descriptor in descriptors, run the appropriate set of steps
      // from the following list:
      for (i = 0 ; i < descriptors.length; i++) {
        desc = descriptors[ i ];

        lastChar = desc[ desc.length - 1 ];
        value = desc.substring(0, desc.length - 1);
        intVal = parseInt(value, 10);
        floatVal = parseFloat(value);

        // If the descriptor consists of a valid non-negative integer followed by
        // a U+0077 LATIN SMALL LETTER W character
        if (regexNonNegativeInteger.test(value) && (lastChar === "w")) {

          // If width and density are not both absent, then let error be yes.
          if (w || d) {pError = true;}

          // Apply the rules for parsing non-negative integers to the descriptor.
          // If the result is zero, let error be yes.
          // Otherwise, let width be the result.
          if (intVal === 0) {pError = true;} else {w = intVal;}

          // If the descriptor consists of a valid floating-point number followed by
          // a U+0078 LATIN SMALL LETTER X character
        } else if (regexFloatingPoint.test(value) && (lastChar === "x")) {

          // If width, density and future-compat-h are not all absent, then let error
          // be yes.
          if (w || d || h) {pError = true;}

          // Apply the rules for parsing floating-point number values to the descriptor.
          // If the result is less than zero, let error be yes. Otherwise, let density
          // be the result.
          if (floatVal < 0) {pError = true;} else {d = floatVal;}

          // If the descriptor consists of a valid non-negative integer followed by
          // a U+0068 LATIN SMALL LETTER H character
        } else if (regexNonNegativeInteger.test(value) && (lastChar === "h")) {

          // If height and density are not both absent, then let error be yes.
          if (h || d) {pError = true;}

          // Apply the rules for parsing non-negative integers to the descriptor.
          // If the result is zero, let error be yes. Otherwise, let future-compat-h
          // be the result.
          if (intVal === 0) {pError = true;} else {h = intVal;}

          // Anything else, Let error be yes.
        } else {pError = true;}
      } // (close step 13 for loop)

      // 15. If error is still no, then append a new image source to candidates whose
      // URL is url, associated with a width width if not absent and a pixel
      // density density if not absent. Otherwise, there is a parse error.
      if (!pError) {
        candidate.url = url;

        if (w) { candidate.w = w;}
        if (d) { candidate.d = d;}
        if (h) { candidate.h = h;}
        if (!h && !d && !w) {candidate.d = 1;}
        if (candidate.d === 1) {set.has1x = true;}
        candidate.set = set;

        candidates.push(candidate);
      }
    } // (close parseDescriptors fn)

    /**
     * Tokenizes descriptor properties prior to parsing
     * Returns undefined.
     * (Again, this fn is defined before it is used, in order to pass JSHINT.
     * Unfortunately this breaks the logical sequencing of the spec comments. :/ )
     */
    function tokenize() {

      // 8.1. Descriptor tokeniser: Skip whitespace
      collectCharacters(regexLeadingSpaces);

      // 8.2. Let current descriptor be the empty string.
      currentDescriptor = "";

      // 8.3. Let state be in descriptor.
      state = "in descriptor";

      while (true) {

        // 8.4. Let c be the character at position.
        c = input.charAt(pos);

        //  Do the following depending on the value of state.
        //  For the purpose of this step, "EOF" is a special character representing
        //  that position is past the end of input.

        // In descriptor
        if (state === "in descriptor") {
          // Do the following, depending on the value of c:

          // Space character
          // If current descriptor is not empty, append current descriptor to
          // descriptors and let current descriptor be the empty string.
          // Set state to after descriptor.
          if (isSpace(c)) {
            if (currentDescriptor) {
              descriptors.push(currentDescriptor);
              currentDescriptor = "";
              state = "after descriptor";
            }

            // U+002C COMMA (,)
            // Advance position to the next character in input. If current descriptor
            // is not empty, append current descriptor to descriptors. Jump to the step
            // labeled descriptor parser.
          } else if (c === ",") {
            pos += 1;
            if (currentDescriptor) {
              descriptors.push(currentDescriptor);
            }
            parseDescriptors();
            return;

            // U+0028 LEFT PARENTHESIS (()
            // Append c to current descriptor. Set state to in parens.
          } else if (c === "\u0028") {
            currentDescriptor = currentDescriptor + c;
            state = "in parens";

            // EOF
            // If current descriptor is not empty, append current descriptor to
            // descriptors. Jump to the step labeled descriptor parser.
          } else if (c === "") {
            if (currentDescriptor) {
              descriptors.push(currentDescriptor);
            }
            parseDescriptors();
            return;

            // Anything else
            // Append c to current descriptor.
          } else {
            currentDescriptor = currentDescriptor + c;
          }
          // (end "in descriptor"

          // In parens
        } else if (state === "in parens") {

          // U+0029 RIGHT PARENTHESIS ())
          // Append c to current descriptor. Set state to in descriptor.
          if (c === ")") {
            currentDescriptor = currentDescriptor + c;
            state = "in descriptor";

            // EOF
            // Append current descriptor to descriptors. Jump to the step labeled
            // descriptor parser.
          } else if (c === "") {
            descriptors.push(currentDescriptor);
            parseDescriptors();
            return;

            // Anything else
            // Append c to current descriptor.
          } else {
            currentDescriptor = currentDescriptor + c;
          }

          // After descriptor
        } else if (state === "after descriptor") {

          // Do the following, depending on the value of c:
          // Space character: Stay in this state.
          if (isSpace(c)) {

            // EOF: Jump to the step labeled descriptor parser.
          } else if (c === "") {
            parseDescriptors();
            return;

            // Anything else
            // Set state to in descriptor. Set position to the previous character in input.
          } else {
            state = "in descriptor";
            pos -= 1;

          }
        }

        // Advance position to the next character in input.
        pos += 1;

        // Repeat this step.
      } // (close while true loop)
    }

    // 4. Splitting loop: Collect a sequence of characters that are space
    //    characters or U+002C COMMA characters. If any U+002C COMMA characters
    //    were collected, that is a parse error.
    while (true) {
      collectCharacters(regexLeadingCommasOrSpaces);

      // 5. If position is past the end of input, return candidates and abort these steps.
      if (pos >= inputLength) {
        return candidates; // (we're done, this is the sole return path)
      }

      // 6. Collect a sequence of characters that are not space characters,
      //    and let that be url.
      url = collectCharacters(regexLeadingNotSpaces);

      // 7. Let descriptors be a new empty list.
      descriptors = [];

      // 8. If url ends with a U+002C COMMA character (,), follow these substeps:
      //		(1). Remove all trailing U+002C COMMA characters from url. If this removed
      //         more than one character, that is a parse error.
      if (url.slice(-1) === ",") {
        url = url.replace(regexTrailingCommas, "");
        // (Jump ahead to step 9 to skip tokenization and just push the candidate).
        parseDescriptors();

        //	Otherwise, follow these substeps:
      } else {
        tokenize();
      } // (close else of step 8)

      // 16. Return to the step labeled splitting loop.
    } // (Close of big while loop.)
  }

  /*
   * Sizes Parser
   *
   * By Alex Bell |  MIT License
   *
   * Non-strict but accurate and lightweight JS Parser for the string value <img sizes="here">
   *
   * Reference algorithm at:
   * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-sizes-attribute
   *
   * Most comments are copied in directly from the spec
   * (except for comments in parens).
   *
   * Grammar is:
   * <source-size-list> = <source-size># [ , <source-size-value> ]? | <source-size-value>
   * <source-size> = <media-condition> <source-size-value>
   * <source-size-value> = <length>
   * http://www.w3.org/html/wg/drafts/html/master/embedded-content.html#attr-img-sizes
   *
   * E.g. "(max-width: 30em) 100vw, (max-width: 50em) 70vw, 100vw"
   * or "(min-width: 30em), calc(30vw - 15px)" or just "30vw"
   *
   * Returns the first valid <css-length> with a media condition that evaluates to true,
   * or "100vw" if all valid media conditions evaluate to false.
   *
   */

  function parseSizes(strValue) {

    // (Percentage CSS lengths are not allowed in this case, to avoid confusion:
    // https://html.spec.whatwg.org/multipage/embedded-content.html#valid-source-size-list
    // CSS allows a single optional plus or minus sign:
    // http://www.w3.org/TR/CSS2/syndata.html#numbers
    // CSS is ASCII case-insensitive:
    // http://www.w3.org/TR/CSS2/syndata.html#characters )
    // Spec allows exponential notation for <number> type:
    // http://dev.w3.org/csswg/css-values/#numbers
    var regexCssLengthWithUnits = /^(?:[+-]?[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?(?:ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmin|vmax|vw)$/i;

    // (This is a quick and lenient test. Because of optional unlimited-depth internal
    // grouping parens and strict spacing rules, this could get very complicated.)
    var regexCssCalc = /^calc\((?:[0-9a-z \.\+\-\*\/\(\)]+)\)$/i;

    var i;
    var unparsedSizesList;
    var unparsedSizesListLength;
    var unparsedSize;
    var lastComponentValue;
    var size;

    // UTILITY FUNCTIONS

    //  (Toy CSS parser. The goals here are:
    //  1) expansive test coverage without the weight of a full CSS parser.
    //  2) Avoiding regex wherever convenient.
    //  Quick tests: http://jsfiddle.net/gtntL4gr/3/
    //  Returns an array of arrays.)
    function parseComponentValues(str) {
      var chrctr;
      var component = "";
      var componentArray = [];
      var listArray = [];
      var parenDepth = 0;
      var pos = 0;
      var inComment = false;

      function pushComponent() {
        if (component) {
          componentArray.push(component);
          component = "";
        }
      }

      function pushComponentArray() {
        if (componentArray[0]) {
          listArray.push(componentArray);
          componentArray = [];
        }
      }

      // (Loop forwards from the beginning of the string.)
      while (true) {
        chrctr = str.charAt(pos);

        if (chrctr === "") { // ( End of string reached.)
          pushComponent();
          pushComponentArray();
          return listArray;
        } else if (inComment) {
          if ((chrctr === "*") && (str[pos + 1] === "/")) { // (At end of a comment.)
            inComment = false;
            pos += 2;
            pushComponent();
            continue;
          } else {
            pos += 1; // (Skip all characters inside comments.)
            continue;
          }
        } else if (isSpace(chrctr)) {
          // (If previous character in loop was also a space, or if
          // at the beginning of the string, do not add space char to
          // component.)
          if ( (str.charAt(pos - 1) && isSpace( str.charAt(pos - 1) ) ) || !component ) {
            pos += 1;
            continue;
          } else if (parenDepth === 0) {
            pushComponent();
            pos +=1;
            continue;
          } else {
            // (Replace any space character with a plain space for legibility.)
            chrctr = " ";
          }
        } else if (chrctr === "(") {
          parenDepth += 1;
        } else if (chrctr === ")") {
          parenDepth -= 1;
        } else if (chrctr === ",") {
          pushComponent();
          pushComponentArray();
          pos += 1;
          continue;
        } else if ( (chrctr === "/") && (str.charAt(pos + 1) === "*") ) {
          inComment = true;
          pos += 2;
          continue;
        }

        component = component + chrctr;
        pos += 1;
      }
    }

    function isValidNonNegativeSourceSizeValue(s) {
      if (regexCssLengthWithUnits.test(s) && (parseFloat(s) >= 0)) {return true;}
      if (regexCssCalc.test(s)) {return true;}
      // ( http://www.w3.org/TR/CSS2/syndata.html#numbers says:
      // "-0 is equivalent to 0 and is not a negative number." which means that
      // unitless zero and unitless negative zero must be accepted as special cases.)
      if ((s === "0") || (s === "-0") || (s === "+0")) {return true;}
      return false;
    }

    // When asked to parse a sizes attribute from an element, parse a
    // comma-separated list of component values from the value of the element's
    // sizes attribute (or the empty string, if the attribute is absent), and let
    // unparsed sizes list be the result.
    // http://dev.w3.org/csswg/css-syntax/#parse-comma-separated-list-of-component-values

    unparsedSizesList = parseComponentValues(strValue);
    unparsedSizesListLength = unparsedSizesList.length;

    // For each unparsed size in unparsed sizes list:
    for (i = 0; i < unparsedSizesListLength; i++) {
      unparsedSize = unparsedSizesList[i];

      // 1. Remove all consecutive <whitespace-token>s from the end of unparsed size.
      // ( parseComponentValues() already omits spaces outside of parens. )

      // If unparsed size is now empty, that is a parse error; continue to the next
      // iteration of this algorithm.
      // ( parseComponentValues() won't push an empty array. )

      // 2. If the last component value in unparsed size is a valid non-negative
      // <source-size-value>, let size be its value and remove the component value
      // from unparsed size. Any CSS function other than the calc() function is
      // invalid. Otherwise, there is a parse error; continue to the next iteration
      // of this algorithm.
      // http://dev.w3.org/csswg/css-syntax/#parse-component-value
      lastComponentValue = unparsedSize[unparsedSize.length - 1];

      if (isValidNonNegativeSourceSizeValue(lastComponentValue)) {
        size = lastComponentValue;
        unparsedSize.pop();
      } else {
        continue;
      }

      // 3. Remove all consecutive <whitespace-token>s from the end of unparsed
      // size. If unparsed size is now empty, return size and exit this algorithm.
      // If this was not the last item in unparsed sizes list, that is a parse error.
      if (unparsedSize.length === 0) {
        return size;
      }

      // 4. Parse the remaining component values in unparsed size as a
      // <media-condition>. If it does not parse correctly, or it does parse
      // correctly but the <media-condition> evaluates to false, continue to the
      // next iteration of this algorithm.
      // (Parsing all possible compound media conditions in JS is heavy, complicated,
      // and the payoff is unclear. Is there ever an situation where the
      // media condition parses incorrectly but still somehow evaluates to true?
      // Can we just rely on the browser/polyfill to do it?)
      unparsedSize = unparsedSize.join(" ");
      if (!(pf.matchesMedia( unparsedSize ) ) ) {
        continue;
      }

      // 5. Return size and exit this algorithm.
      return size;
    }

    // If the above algorithm exhausts unparsed sizes list without returning a
    // size value, return 100vw.
    return "100vw";
  }

  // namespace
  pf.ns = ("pf" + new Date().getTime()).substr(0, 9);

  // srcset support test
  pf.supSrcset = "srcset" in image;
  pf.supSizes = "sizes" in image;
  pf.supPicture = !!window.HTMLPictureElement;

  // UC browser does claim to support srcset and picture, but not sizes,
  // this extended test reveals the browser does support nothing
  if (pf.supSrcset && pf.supPicture && !pf.supSizes) {
    (function(image2) {
      image.srcset = "data:,a";
      image2.src = "data:,a";
      pf.supSrcset = image.complete === image2.complete;
      pf.supPicture = pf.supSrcset && pf.supPicture;
    })(document.createElement("img"));
  }

  // Safari9 has basic support for sizes, but does't expose the `sizes` idl attribute
  if (pf.supSrcset && !pf.supSizes) {

    (function() {
      var width2 = "data:image/gif;base64,R0lGODlhAgABAPAAAP///wAAACH5BAAAAAAALAAAAAACAAEAAAICBAoAOw==";
      var width1 = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      var img = document.createElement("img");
      var test = function() {
        var width = img.width;

        if (width === 2) {
          pf.supSizes = true;
        }

        alwaysCheckWDescriptor = pf.supSrcset && !pf.supSizes;

        isSupportTestReady = true;
        // force async
        setTimeout(picturefill);
      };

      img.onload = test;
      img.onerror = test;
      img.setAttribute("sizes", "9px");

      img.srcset = width1 + " 1w," + width2 + " 9w";
      img.src = width1;
    })();

  } else {
    isSupportTestReady = true;
  }

  // using pf.qsa instead of dom traversing does scale much better,
  // especially on sites mixing responsive and non-responsive images
  pf.selShort = "picture>img,img[srcset]";
  pf.sel = pf.selShort;
  pf.cfg = cfg;

  /**
   * Shortcut property for `devicePixelRatio` ( for easy overriding in tests )
   */
  pf.DPR = (DPR  || 1 );
  pf.u = units;

  // container of supported mime types that one might need to qualify before using
  pf.types =  types;

  pf.setSize = noop;

  /**
   * Gets a string and returns the absolute URL
   * @param src
   * @returns {String} absolute URL
   */

  pf.makeUrl = memoize(function(src) {
    anchor.href = src;
    return anchor.href;
  });

  /**
   * Gets a DOM element or document and a selctor and returns the found matches
   * Can be extended with jQuery/Sizzle for IE7 support
   * @param context
   * @param sel
   * @returns {NodeList|Array}
   */
  pf.qsa = function(context, sel) {
    return ( "querySelector" in context ) ? context.querySelectorAll(sel) : [];
  };

  /**
   * Shortcut method for matchMedia ( for easy overriding in tests )
   * wether native or pf.mMQ is used will be decided lazy on first call
   * @returns {boolean}
   */
  pf.matchesMedia = function() {
    if ( window.matchMedia && (matchMedia( "(min-width: 0.1em)" ) || {}).matches ) {
      pf.matchesMedia = function( media ) {
        return !media || ( matchMedia( media ).matches );
      };
    } else {
      pf.matchesMedia = pf.mMQ;
    }

    return pf.matchesMedia.apply( this, arguments );
  };

  /**
   * A simplified matchMedia implementation for IE8 and IE9
   * handles only min-width/max-width with px or em values
   * @param media
   * @returns {boolean}
   */
  pf.mMQ = function( media ) {
    return media ? evalCSS(media) : true;
  };

  /**
   * Returns the calculated length in css pixel from the given sourceSizeValue
   * http://dev.w3.org/csswg/css-values-3/#length-value
   * intended Spec mismatches:
   * * Does not check for invalid use of CSS functions
   * * Does handle a computed length of 0 the same as a negative and therefore invalid value
   * @param sourceSizeValue
   * @returns {Number}
   */
  pf.calcLength = function( sourceSizeValue ) {

    var value = evalCSS(sourceSizeValue, true) || false;
    if (value < 0) {
      value = false;
    }

    return value;
  };

  /**
   * Takes a type string and checks if its supported
   */

  pf.supportsType = function( type ) {
    return ( type ) ? types[ type ] : true;
  };

  /**
   * Parses a sourceSize into mediaCondition (media) and sourceSizeValue (length)
   * @param sourceSizeStr
   * @returns {*}
   */
  pf.parseSize = memoize(function( sourceSizeStr ) {
    var match = ( sourceSizeStr || "" ).match(regSize);
    return {
      media: match && match[1],
      length: match && match[2]
    };
  });

  pf.parseSet = function( set ) {
    if ( !set.cands ) {
      set.cands = parseSrcset(set.srcset, set);
    }
    return set.cands;
  };

  /**
   * returns 1em in css px for html/body default size
   * function taken from respondjs
   * @returns {*|number}
   */
  pf.getEmValue = function() {
    var body;
    if ( !eminpx && (body = document.body) ) {
      var div = document.createElement( "div" ),
        originalHTMLCSS = docElem.style.cssText,
        originalBodyCSS = body.style.cssText;

      div.style.cssText = baseStyle;

      // 1em in a media query is the value of the default font size of the browser
      // reset docElem and body to ensure the correct value is returned
      docElem.style.cssText = fsCss;
      body.style.cssText = fsCss;

      body.appendChild( div );
      eminpx = div.offsetWidth;
      body.removeChild( div );

      //also update eminpx before returning
      eminpx = parseFloat( eminpx, 10 );

      // restore the original values
      docElem.style.cssText = originalHTMLCSS;
      body.style.cssText = originalBodyCSS;

    }
    return eminpx || 16;
  };

  /**
   * Takes a string of sizes and returns the width in pixels as a number
   */
  pf.calcListLength = function( sourceSizeListStr ) {
    // Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
    //
    //                           or (min-width:30em) calc(30% - 15px)
    if ( !(sourceSizeListStr in sizeLengthCache) || cfg.uT ) {
      var winningLength = pf.calcLength( parseSizes( sourceSizeListStr ) );

      sizeLengthCache[ sourceSizeListStr ] = !winningLength ? units.width : winningLength;
    }

    return sizeLengthCache[ sourceSizeListStr ];
  };

  /**
   * Takes a candidate object with a srcset property in the form of url/
   * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
   *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
   *     "images/pic-small.png"
   * Get an array of image candidates in the form of
   *      {url: "/foo/bar.png", resolution: 1}
   * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
   * If sizes is specified, res is calculated
   */
  pf.setRes = function( set ) {
    var candidates;
    if ( set ) {

      candidates = pf.parseSet( set );

      for ( var i = 0, len = candidates.length; i < len; i++ ) {
        setResolution( candidates[ i ], set.sizes );
      }
    }
    return candidates;
  };

  pf.setRes.res = setResolution;

  pf.applySetCandidate = function( candidates, img ) {
    if ( !candidates.length ) {return;}
    var candidate,
      i,
      j,
      length,
      bestCandidate,
      curSrc,
      curCan,
      candidateSrc,
      abortCurSrc;

    var imageData = img[ pf.ns ];
    var dpr = pf.DPR;

    curSrc = imageData.curSrc || img[curSrcProp];

    curCan = imageData.curCan || setSrcToCur(img, curSrc, candidates[0].set);

    // if we have a current source, we might either become lazy or give this source some advantage
    if ( curCan && curCan.set === candidates[ 0 ].set ) {

      // if browser can abort image request and the image has a higher pixel density than needed
      // and this image isn't downloaded yet, we skip next part and try to save bandwidth
      abortCurSrc = (supportAbort && !img.complete && curCan.res - 0.1 > dpr);

      if ( !abortCurSrc ) {
        curCan.cached = true;

        // if current candidate is "best", "better" or "okay",
        // set it to bestCandidate
        if ( curCan.res >= dpr ) {
          bestCandidate = curCan;
        }
      }
    }

    if ( !bestCandidate ) {

      candidates.sort( ascendingSort );

      length = candidates.length;
      bestCandidate = candidates[ length - 1 ];

      for ( i = 0; i < length; i++ ) {
        candidate = candidates[ i ];
        if ( candidate.res >= dpr ) {
          j = i - 1;

          // we have found the perfect candidate,
          // but let's improve this a little bit with some assumptions ;-)
          if (candidates[ j ] &&
            (abortCurSrc || curSrc !== pf.makeUrl( candidate.url )) &&
            chooseLowRes(candidates[ j ].res, candidate.res, dpr, candidates[ j ].cached)) {

            bestCandidate = candidates[ j ];

          } else {
            bestCandidate = candidate;
          }
          break;
        }
      }
    }

    if ( bestCandidate ) {

      candidateSrc = pf.makeUrl( bestCandidate.url );

      imageData.curSrc = candidateSrc;
      imageData.curCan = bestCandidate;

      if ( candidateSrc !== curSrc ) {
        pf.setSrc( img, bestCandidate );
      }
      pf.setSize( img );
    }
  };

  pf.setSrc = function( img, bestCandidate ) {
    var origWidth;
    img.src = bestCandidate.url;

    // although this is a specific Safari issue, we don't want to take too much different code paths
    if ( bestCandidate.set.type === "image/svg+xml" ) {
      origWidth = img.style.width;
      img.style.width = (img.offsetWidth + 1) + "px";

      // next line only should trigger a repaint
      // if... is only done to trick dead code removal
      if ( img.offsetWidth + 1 ) {
        img.style.width = origWidth;
      }
    }
  };

  pf.getSet = function( img ) {
    var i, set, supportsType;
    var match = false;
    var sets = img [ pf.ns ].sets;

    for ( i = 0; i < sets.length && !match; i++ ) {
      set = sets[i];

      if ( !set.srcset || !pf.matchesMedia( set.media ) || !(supportsType = pf.supportsType( set.type )) ) {
        continue;
      }

      if ( supportsType === "pending" ) {
        set = supportsType;
      }

      match = set;
      break;
    }

    return match;
  };

  pf.parseSets = function( element, parent, options ) {
    var srcsetAttribute, imageSet, isWDescripor, srcsetParsed;

    var hasPicture = parent && parent.nodeName.toUpperCase() === "PICTURE";
    var imageData = element[ pf.ns ];

    if ( imageData.src === undefined || options.src ) {
      imageData.src = getImgAttr.call( element, "src" );
      if ( imageData.src ) {
        setImgAttr.call( element, srcAttr, imageData.src );
      } else {
        removeImgAttr.call( element, srcAttr );
      }
    }

    if ( imageData.srcset === undefined || options.srcset || !pf.supSrcset || element.srcset ) {
      srcsetAttribute = getImgAttr.call( element, "srcset" );
      imageData.srcset = srcsetAttribute;
      srcsetParsed = true;
    }

    imageData.sets = [];

    if ( hasPicture ) {
      imageData.pic = true;
      getAllSourceElements( parent, imageData.sets );
    }

    if ( imageData.srcset ) {
      imageSet = {
        srcset: imageData.srcset,
        sizes: getImgAttr.call( element, "sizes" )
      };

      imageData.sets.push( imageSet );

      isWDescripor = (alwaysCheckWDescriptor || imageData.src) && regWDesc.test(imageData.srcset || "");

      // add normal src as candidate, if source has no w descriptor
      if ( !isWDescripor && imageData.src && !getCandidateForSrc(imageData.src, imageSet) && !imageSet.has1x ) {
        imageSet.srcset += ", " + imageData.src;
        imageSet.cands.push({
          url: imageData.src,
          d: 1,
          set: imageSet
        });
      }

    } else if ( imageData.src ) {
      imageData.sets.push( {
        srcset: imageData.src,
        sizes: null
      } );
    }

    imageData.curCan = null;
    imageData.curSrc = undefined;

    // if img has picture or the srcset was removed or has a srcset and does not support srcset at all
    // or has a w descriptor (and does not support sizes) set support to false to evaluate
    imageData.supported = !( hasPicture || ( imageSet && !pf.supSrcset ) || (isWDescripor && !pf.supSizes) );

    if ( srcsetParsed && pf.supSrcset && !imageData.supported ) {
      if ( srcsetAttribute ) {
        setImgAttr.call( element, srcsetAttr, srcsetAttribute );
        element.srcset = "";
      } else {
        removeImgAttr.call( element, srcsetAttr );
      }
    }

    if (imageData.supported && !imageData.srcset && ((!imageData.src && element.src) ||  element.src !== pf.makeUrl(imageData.src))) {
      if (imageData.src === null) {
        element.removeAttribute("src");
      } else {
        element.src = imageData.src;
      }
    }

    imageData.parsed = true;
  };

  pf.fillImg = function(element, options) {
    var imageData;
    var extreme = options.reselect || options.reevaluate;

    // expando for caching data on the img
    if ( !element[ pf.ns ] ) {
      element[ pf.ns ] = {};
    }

    imageData = element[ pf.ns ];

    // if the element has already been evaluated, skip it
    // unless `options.reevaluate` is set to true ( this, for example,
    // is set to true when running `picturefill` on `resize` ).
    if ( !extreme && imageData.evaled === evalId ) {
      return;
    }

    if ( !imageData.parsed || options.reevaluate ) {
      pf.parseSets( element, element.parentNode, options );
    }

    if ( !imageData.supported ) {
      applyBestCandidate( element );
    } else {
      imageData.evaled = evalId;
    }
  };

  pf.setupRun = function() {
    if ( !alreadyRun || isVwDirty || (DPR !== window.devicePixelRatio) ) {
      updateMetrics();
    }
  };

  // If picture is supported, well, that's awesome.
  if ( pf.supPicture ) {
    picturefill = noop;
    pf.fillImg = noop;
  } else {

    // Set up picture polyfill by polling the document
    (function() {
      var isDomReady;
      var regReady = window.attachEvent ? /d$|^c/ : /d$|^c|^i/;

      var run = function() {
        var readyState = document.readyState || "";

        timerId = setTimeout(run, readyState === "loading" ? 200 :  999);
        if ( document.body ) {
          pf.fillImgs();
          isDomReady = isDomReady || regReady.test(readyState);
          if ( isDomReady ) {
            clearTimeout( timerId );
          }

        }
      };

      var timerId = setTimeout(run, document.body ? 9 : 99);

      // Also attach picturefill on resize and readystatechange
      // http://modernjavascript.blogspot.com/2013/08/building-better-debounce.html
      var debounce = function(func, wait) {
        var timeout, timestamp;
        var later = function() {
          var last = (new Date()) - timestamp;

          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            func();
          }
        };

        return function() {
          timestamp = new Date();

          if (!timeout) {
            timeout = setTimeout(later, wait);
          }
        };
      };
      var lastClientWidth = docElem.clientHeight;
      var onResize = function() {
        isVwDirty = Math.max(window.innerWidth || 0, docElem.clientWidth) !== units.width || docElem.clientHeight !== lastClientWidth;
        lastClientWidth = docElem.clientHeight;
        if ( isVwDirty ) {
          pf.fillImgs();
        }
      };

      on( window, "resize", debounce(onResize, 99 ) );
      on( document, "readystatechange", run );
    })();
  }

  pf.picturefill = picturefill;
  //use this internally for easy monkey patching/performance testing
  pf.fillImgs = picturefill;
  pf.teardownRun = noop;

  /* expose methods for testing */
  picturefill._ = pf;

  window.picturefillCFG = {
    pf: pf,
    push: function(args) {
      var name = args.shift();
      if (typeof pf[name] === "function") {
        pf[name].apply(pf, args);
      } else {
        cfg[name] = args[0];
        if (alreadyRun) {
          pf.fillImgs( { reselect: true } );
        }
      }
    }
  };

  while (setOptions && setOptions.length) {
    window.picturefillCFG.push(setOptions.shift());
  }

  /* expose picturefill */
  window.picturefill = picturefill;

  /* expose picturefill */
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    // CommonJS, just export
    module.exports = picturefill;
  } else if ( typeof define === "function" && define.amd ) {
    // AMD support
    define( "picturefill", function() { return picturefill; } );
  }

  // IE8 evals this sync, so it must be the last thing we do
  if ( !pf.supPicture ) {
    types[ "image/webp" ] = detectTypeSupport("image/webp", "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==" );
  }

} )( window, document );
