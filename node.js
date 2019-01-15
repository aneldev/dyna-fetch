(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("dyna-fetch", [], factory);
	else if(typeof exports === 'object')
		exports["dyna-fetch"] = factory();
	else
		root["dyna-fetch"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/node.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/dynaFetch.ts":
/*!**************************!*\
  !*** ./src/dynaFetch.ts ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var axios_1 = __webpack_require__(/*! axios */ "axios");

var dyna_loops_1 = __webpack_require__(/*! dyna-loops */ "dyna-loops");

var defaultDynaFetchParams = {
  timeout: 0,
  retryMaxTimes: 0,
  retryTimeout: 0,
  timeoutRandomFactor: 1,
  onRetry: function () {
    return undefined;
  }
};

exports.dynaFetch = function (url, axiosRequestConfig, dynaFetchParams_) {
  if (axiosRequestConfig === void 0) {
    axiosRequestConfig = {};
  }

  if (dynaFetchParams_ === void 0) {
    dynaFetchParams_ = {};
  }

  var dynaFetchParams = __assign({}, defaultDynaFetchParams, dynaFetchParams_);

  var aborted = false;
  var timeoutTimer;
  var failedTimes = 0;
  var reject_;
  var debugInfo;

  var getDelay = function () {
    return dynaFetchParams.retryTimeout * (dyna_loops_1.random(0, dynaFetchParams.timeoutRandomFactor * 100) / 100);
  };

  var output = new Promise(function (resolve, reject) {
    reject_ = reject;
    debugInfo = {
      url: url,
      fetchParams: axiosRequestConfig,
      dynaFetchParams: dynaFetchParams_,
      failedTimes: failedTimes
    };

    var callFetch = function () {
      axios_1.default.request(__assign({}, axiosRequestConfig, {
        url: url || axiosRequestConfig.url
      })).then(function (response) {
        if (aborted) return;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        resolve(response);
      }).catch(function (error) {
        if (aborted) return;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        failedTimes++;

        if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
          dynaFetchParams.onRetry && dynaFetchParams.onRetry();
          setTimeout(function () {
            return callFetch();
          }, getDelay());
        } else {
          reject({
            code: 5007,
            message: 'general fetch network error (see the error property)',
            data: debugInfo,
            error: error
          });
        }
      });

      if (dynaFetchParams.timeout) {
        timeoutTimer = setTimeout(function () {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          failedTimes++;

          if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
            dynaFetchParams.onRetry && dynaFetchParams.onRetry();
            setTimeout(function () {
              return callFetch();
            }, getDelay());
          } else {
            aborted = true;
            reject({
              code: 5017,
              section: 'dynaFetch',
              message: 'timeout error',
              data: debugInfo
            });
          }
        }, dynaFetchParams.timeout);
      }
    };

    callFetch();
  });

  output.abort = function () {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    aborted = true;
    reject_({
      code: 5019,
      section: 'dynaFetch',
      message: 'abort',
      data: debugInfo
    });
  };

  return output;
};

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var dynaFetch_1 = __webpack_require__(/*! ./dynaFetch */ "./src/dynaFetch.ts");

exports.dynaFetch = dynaFetch_1.dynaFetch;

/***/ }),

/***/ "./src/node.ts":
/*!*********************!*\
  !*** ./src/node.ts ***!
  \*********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(__webpack_require__(/*! ./index */ "./src/index.ts"));

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "dyna-loops":
/*!*****************************!*\
  !*** external "dyna-loops" ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("dyna-loops");

/***/ })

/******/ });
});
//# sourceMappingURL=node.js.map