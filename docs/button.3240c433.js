// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../../node_modules/vanilla-tilt/lib/vanilla-tilt.js":[function(require,module,exports) {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * Created by Șandor Sergiu (micku7zu) on 1/27/2017.
 * Original idea: https://github.com/gijsroge/tilt.js
 * MIT License.
 * Version 1.5.0
 */

var VanillaTilt = function () {
  function VanillaTilt(element) {
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, VanillaTilt);

    if (!(element instanceof Node)) {
      throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
    }

    this.width = null;
    this.height = null;
    this.left = null;
    this.top = null;
    this.transitionTimeout = null;
    this.updateCall = null;

    this.updateBind = this.update.bind(this);
    this.resetBind = this.reset.bind(this);

    this.element = element;
    this.settings = this.extendSettings(settings);
    this.elementListener = this.getElementListener();

    this.reverse = this.settings.reverse ? -1 : 1;

    this.glare = this.isSettingTrue(this.settings.glare);
    this.glarePrerender = this.isSettingTrue(this.settings["glare-prerender"]);

    if (this.glare) {
      this.prepareGlare();
    }

    this.addEventListeners();
  }

  VanillaTilt.prototype.isSettingTrue = function isSettingTrue(setting) {
    return setting === "" || setting === true || setting === 1;
  };

  /**
   * Method returns element what will be listen mouse events
   * @return {Node}
   */


  VanillaTilt.prototype.getElementListener = function getElementListener() {
    if (!this.settings || !this.settings["mouse-event-element"]) {
      return this.element;
    }

    if (typeof this.settings["mouse-event-element"] === "string") {
      var mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);

      if (mouseEventElement) {
        return mouseEventElement;
      }
    }

    if (this.settings["mouse-event-element"] instanceof Node) {
      return this.settings["mouse-event-element"];
    }
  };

  /**
   * Method set listen methods for this.elementListener
   * @return {Node}
   */


  VanillaTilt.prototype.addEventListeners = function addEventListeners() {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseMoveBind = this.onMouseMove.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onWindowResizeBind = this.onWindowResizeBind.bind(this);

    this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);
    this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);

    if (this.glare) {
      window.addEventListener("resize", this.onWindowResizeBind);
    }
  };

  /**
   * Method remove event listeners from current this.elementListener
   */


  VanillaTilt.prototype.removeEventListeners = function removeEventListeners() {
    this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);
    this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);

    if (this.glare) {
      window.removeEventListener("resize", this.onWindowResizeBind);
    }
  };

  VanillaTilt.prototype.destroy = function destroy() {
    clearTimeout(this.transitionTimeout);
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.reset();

    this.removeEventListeners();
    this.element.vanillaTilt = null;
    delete this.element.vanillaTilt;

    this.element = null;
  };

  VanillaTilt.prototype.onMouseEnter = function onMouseEnter() {
    this.updateElementPosition();
    this.element.style.willChange = "transform";
    this.setTransition();
  };

  VanillaTilt.prototype.onMouseMove = function onMouseMove(event) {
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = event;
    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseLeave = function onMouseLeave() {
    this.setTransition();

    if (this.settings.reset) {
      requestAnimationFrame(this.resetBind);
    }
  };

  VanillaTilt.prototype.reset = function reset() {
    this.event = {
      pageX: this.left + this.width / 2,
      pageY: this.top + this.height / 2
    };

    if (this.element && this.element.style) {
      this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(0deg) " + "rotateY(0deg) " + "scale3d(1, 1, 1)";
    }

    if (this.glare) {
      this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "0";
    }
  };

  VanillaTilt.prototype.getValues = function getValues() {
    var x = (this.event.clientX - this.left) / this.width;
    var y = (this.event.clientY - this.top) / this.height;

    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);

    var tiltX = (this.reverse * (this.settings.max / 2 - x * this.settings.max)).toFixed(2);
    var tiltY = (this.reverse * (y * this.settings.max - this.settings.max / 2)).toFixed(2);
    var angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

    return {
      tiltX: tiltX,
      tiltY: tiltY,
      percentageX: x * 100,
      percentageY: y * 100,
      angle: angle
    };
  };

  VanillaTilt.prototype.updateElementPosition = function updateElementPosition() {
    var rect = this.element.getBoundingClientRect();

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.left = rect.left;
    this.top = rect.top;
  };

  VanillaTilt.prototype.update = function update() {
    var values = this.getValues();

    this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " + "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " + "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

    if (this.glare) {
      this.glareElement.style.transform = "rotate(" + values.angle + "deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "" + values.percentageY * this.settings["max-glare"] / 100;
    }

    this.element.dispatchEvent(new CustomEvent("tiltChange", {
      "detail": values
    }));

    this.updateCall = null;
  };

  /**
   * Appends the glare element (if glarePrerender equals false)
   * and sets the default style
   */


  VanillaTilt.prototype.prepareGlare = function prepareGlare() {
    // If option pre-render is enabled we assume all html/css is present for an optimal glare effect.
    if (!this.glarePrerender) {
      // Create glare element
      var jsTiltGlare = document.createElement("div");
      jsTiltGlare.classList.add("js-tilt-glare");

      var jsTiltGlareInner = document.createElement("div");
      jsTiltGlareInner.classList.add("js-tilt-glare-inner");

      jsTiltGlare.appendChild(jsTiltGlareInner);
      this.element.appendChild(jsTiltGlare);
    }

    this.glareElementWrapper = this.element.querySelector(".js-tilt-glare");
    this.glareElement = this.element.querySelector(".js-tilt-glare-inner");

    if (this.glarePrerender) {
      return;
    }

    Object.assign(this.glareElementWrapper.style, {
      "position": "absolute",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "100%",
      "overflow": "hidden"
    });

    Object.assign(this.glareElement.style, {
      "position": "absolute",
      "top": "50%",
      "left": "50%",
      "pointer-events": "none",
      "background-image": "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
      "width": this.element.offsetWidth * 2 + "px",
      "height": this.element.offsetWidth * 2 + "px",
      "transform": "rotate(180deg) translate(-50%, -50%)",
      "transform-origin": "0% 0%",
      "opacity": "0"
    });
  };

  VanillaTilt.prototype.updateGlareSize = function updateGlareSize() {
    Object.assign(this.glareElement.style, {
      "width": "" + this.element.offsetWidth * 2,
      "height": "" + this.element.offsetWidth * 2
    });
  };

  VanillaTilt.prototype.onWindowResizeBind = function onWindowResizeBind() {
    this.updateGlareSize();
  };

  VanillaTilt.prototype.setTransition = function setTransition() {
    var _this = this;

    clearTimeout(this.transitionTimeout);
    this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
    if (this.glare) this.glareElement.style.transition = "opacity " + this.settings.speed + "ms " + this.settings.easing;

    this.transitionTimeout = setTimeout(function () {
      _this.element.style.transition = "";
      if (_this.glare) {
        _this.glareElement.style.transition = "";
      }
    }, this.settings.speed);
  };

  /**
   * Method return patched settings of instance
   * @param {boolean} settings.reverse - reverse the tilt direction
   * @param {number} settings.max - max tilt rotation (degrees)
   * @param {number} settings.perspective - Transform perspective, the lower the more extreme the tilt gets
   * @param {string} settings.easing - Easing on enter/exit
   * @param {number} settings.scale - 2 = 200%, 1.5 = 150%, etc..
   * @param {number} settings.speed - Speed of the enter/exit transition
   * @param {boolean} settings.transition - Set a transition on enter/exit
   * @param settings.axis - What axis should be disabled. Can be X or Y
   * @param {boolean} settings.glare - What axis should be disabled. Can be X or Y
   * @param {number} settings.max-glare - the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
   * @param {boolean} settings.glare-prerender - false = VanillaTilt creates the glare elements for you, otherwise
   * @param {string|object} settings.mouse-event-element - String selector or link to HTML-element what will be listen mouse events
   * @param {boolean} settings.reset - false = If the tilt effect has to be reset on exit
   */


  VanillaTilt.prototype.extendSettings = function extendSettings(settings) {
    var defaultSettings = {
      reverse: false,
      max: 35,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      scale: 1,
      speed: 300,
      transition: true,
      axis: null,
      glare: false,
      "max-glare": 1,
      "glare-prerender": false,
      "mouse-event-element": null,
      reset: true
    };

    var newSettings = {};
    for (var property in defaultSettings) {
      if (property in settings) {
        newSettings[property] = settings[property];
      } else if (this.element.hasAttribute("data-tilt-" + property)) {
        var attribute = this.element.getAttribute("data-tilt-" + property);
        try {
          newSettings[property] = JSON.parse(attribute);
        } catch (e) {
          newSettings[property] = attribute;
        }
      } else {
        newSettings[property] = defaultSettings[property];
      }
    }

    return newSettings;
  };

  VanillaTilt.init = function init(elements, settings) {
    if (elements instanceof Node) {
      elements = [elements];
    }

    if (elements instanceof NodeList) {
      elements = [].slice.call(elements);
    }

    if (!(elements instanceof Array)) {
      return;
    }

    elements.forEach(function (element) {
      if (!("vanillaTilt" in element)) {
        element.vanillaTilt = new VanillaTilt(element, settings);
      }
    });
  };

  return VanillaTilt;
}();

if (typeof document !== "undefined") {
  /* expose the class to window */
  window.VanillaTilt = VanillaTilt;

  /**
   * Auto load
   */
  VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}

module.exports = VanillaTilt;

},{}],"button.js":[function(require,module,exports) {
"use strict";

var _vanillaTilt = _interopRequireDefault(require("vanilla-tilt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var btnWrapper = document.getElementById('button-wrapper');
var svgContainer = document.getElementById('svg-container');
var btn = document.getElementById('button');
var input = document.getElementById('input');

function remove(e) {
  var event = e || window.event;
  var target = event.target || event.srcElement;
  svgContainer.removeChild(target);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

_vanillaTilt.default.init(btn, {
  scale: 1.1,
  speed: 1000
});

function explode() {
  var symbolArray = ['#donut', '#circle', '#tri_hollow', '#triangle', '#square', '#squ_hollow'];
  var particles = 10;
  var children = '';

  for (var i = 0; i < particles; i++) {
    var randomSymbol = rand(0, symbolArray.length - 1); // positioning x,y of the particles

    var x = btnWrapper.offsetWidth / 2 + rand(120, 200) * Math.cos(Math.PI * Math.random());
    var y = btnWrapper.offsetHeight / 2 + rand(80, 150) * Math.cos(Math.PI * Math.random());
    var deg = rand(0, 360) + 'deg';
    var scale = rand(0.5, 1.1); // particle element creation

    children = children + "\n      <svg\n        class=\"symbol\"\n        style=\"top: ".concat(y, "px; left: ").concat(x, "px; transform: scale(").concat(scale, ") rotate(").concat(deg, ");\"\n      >\n      <use xlink:href=\"").concat(symbolArray[randomSymbol], "\" />\n      </svg>\n    ");
  }

  svgContainer.innerHTML = children;

  var elements = _toConsumableArray(document.getElementsByClassName('symbol'));

  elements.forEach(function (elm) {
    elm.addEventListener('webkitAnimationEnd', remove);
    elm.addEventListener('animationend', remove);
  });
}

function handleClick() {
  explode();
  input.click();
}

btn.addEventListener('click', handleClick);
},{"vanilla-tilt":"../../node_modules/vanilla-tilt/lib/vanilla-tilt.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "2322" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","button.js"], null)
//# sourceMappingURL=/button.3240c433.map