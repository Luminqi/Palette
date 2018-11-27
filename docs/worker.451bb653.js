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
})({"../palette/getPalette.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPalette = getPalette;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function getPalette(buffer) {
  var data = new Uint8ClampedArray(buffer);

  var _processData = processData(data),
      sortedData = _processData.sortedData,
      total = _processData.total;

  var binArr = binning(sortedData, total);
  var result = mergeBins(binArr);
  return result.map(function (bin) {
    var percent = (bin.data.length / (3 * total)).toFixed(3);
    return {
      value: bin.average,
      percent: percent
    };
  }).sort(function (_ref, _ref2) {
    var p1 = _ref.percent;
    var p2 = _ref2.percent;

    if (p1 > p2) {
      return -1;
    } else if (p1 < p2) {
      return 1;
    } else {
      return 0;
    }
  });
}

function processData(data) {
  var processedData = [];
  var length = data.length;
  var ratio = length <= 5000 ? 1 : Math.round(length / 5000);

  for (var i = 0; i <= length - 4; i = i + 4 * ratio) {
    var hue = getHue(data[i], data[i + 1], data[i + 2]);
    processedData.push(data[i], data[i + 1], data[i + 2], hue);
  }

  return {
    sortedData: sortByHue(processedData),
    total: processedData.length / 4
  };
}

function getHue(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var hue = null;

  switch (max) {
    case min:
      {
        return 0;
      }

    case r:
      {
        hue = (g - b) / (max - min);
        break;
      }

    case g:
      {
        hue = 2 + (b - r) / (max - min);
        break;
      }

    case b:
      {
        hue = 4 + (r - g) / (max - min);
      }
  }

  hue = hue * 60;
  if (hue > 360) hue = hue - 360;
  if (hue < 0) hue = hue + 360;
  return Math.round(hue);
}

function sortByHue(a) {
  var l = a.length;
  var b = [];
  var c = [];
  var j = 0;

  for (var i = 0; i <= 360; i++) {
    c[i] = [];
  }

  for (var _i = 0; _i <= l - 4; _i = _i + 4) {
    c[a[_i + 3]].push(a[_i], a[_i + 1], a[_i + 2]);
  }

  for (var _i2 = 0; _i2 <= 360; _i2++) {
    if (c[_i2].length) {
      b[j] = [_i2];
      b[j].push(c[_i2]);
      j = j + 1;
    }
  }

  return b;
}

function binning(sortedData, total) {
  var binArr = [];

  var rec = function rec(data) {
    var length = data.length;
    var start = data[0][0];
    var end = data[length - 1][0];
    var mid = Math.floor((end + start) / 2);
    var data1 = [];
    var data2 = [];

    for (var i = 0; i <= length - 1; i++) {
      if (data[i][0] <= mid) {
        data1.push(data[i]);
      } else {
        data2.push(data[i]);
      }
    }

    if (shouldComplete(data1)) {
      var bin1 = new Bin(data1, total);
      binArr.push(bin1);
    } else {
      rec(data1);
    }

    if (shouldComplete(data2)) {
      var bin2 = new Bin(data2, total);
      binArr.push(bin2);
    } else {
      rec(data2);
    }
  };

  rec(sortedData);
  return binArr;
}

function shouldComplete(data) {
  var length = data.length;
  var start = data[0][0];
  var end = data[length - 1][0];
  var total = 0;

  for (var i = 0; i <= length - 1; i++) {
    total = total + data[i][1].length;
  }

  return total <= 3 || end - start <= 36;
}

function mergeBins(binArr) {
  var length = binArr.length;

  if (!length) {
    throw new error('faild to extract colors');
  }

  var i = 0;

  do {
    if (length === 1) {
      return;
    }

    if (binArr[i].trivial || getDistance(binArr[i + 1].average, binArr[i].average) <= 36) {
      binArr[i + 1].merge(binArr[i]);
      binArr.splice(i, 1);
      length = length - 1;
      continue;
    }

    i = i + 1;
  } while (i < length - 1);

  if (binArr[i].trivial) {
    binArr[i].merge(binArr[i - 1]);
    binArr.splice(i - 1, 1);
  }

  return binArr;
}

function getDistance(_ref3, _ref4) {
  var _ref5 = _slicedToArray(_ref3, 3),
      r1 = _ref5[0],
      g1 = _ref5[1],
      b1 = _ref5[2];

  var _ref6 = _slicedToArray(_ref4, 3),
      r2 = _ref6[0],
      g2 = _ref6[1],
      b2 = _ref6[2];

  return Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2);
}

var Bin =
/*#__PURE__*/
function () {
  function Bin(data, total) {
    _classCallCheck(this, Bin);

    this.data = this.ignoreHue(data);
    this.total = total;
    this.trivial = this.isTrivial();
    this.average = this.getAvarage();
  }

  _createClass(Bin, [{
    key: "ignoreHue",
    value: function ignoreHue(data) {
      return data.reduce(function (prev, curr) {
        prev.push.apply(prev, _toConsumableArray(curr[1]));
        return prev;
      }, []);
    }
  }, {
    key: "merge",
    value: function merge(bin) {
      var newData = bin.data;
      this.data = _toConsumableArray(newData).concat(_toConsumableArray(this.data));
      this.trivial = this.isTrivial();
      this.average = this.getAvarage();
    }
  }, {
    key: "isTrivial",
    value: function isTrivial() {
      return this.data.length / 3 <= Math.ceil(this.total / 50);
    }
  }, {
    key: "getAvarage",
    value: function getAvarage() {
      var r = 0;
      var g = 0;
      var b = 0;
      var data = this.data;
      var length = data.length;

      for (var i = 0; i <= length - 3; i = i + 3) {
        r = r + data[i];
        g = g + data[i + 1];
        b = b + data[i + 2];
      }

      return [r, g, b].map(function (v) {
        return Math.round(3 * v / length);
      });
    }
  }]);

  return Bin;
}();
},{}],"../palette/worker.js":[function(require,module,exports) {
"use strict";

var _getPalette = require("./getPalette");

onmessage = function onmessage(e) {
  var palette = (0, _getPalette.getPalette)(e.data);
  postMessage(palette);
};
},{"./getPalette":"../palette/getPalette.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","../palette/worker.js"], null)
//# sourceMappingURL=/worker.451bb653.map