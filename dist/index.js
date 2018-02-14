(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("isomorphic-fetch"));
	else if(typeof define === 'function' && define.amd)
		define("dyna-fetch", ["isomorphic-fetch"], factory);
	else if(typeof exports === 'object')
		exports["dyna-fetch"] = factory(require("isomorphic-fetch"));
	else
		root["dyna-fetch"] = factory(root["isomorphic-fetch"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dynaFetch_1 = __webpack_require__(1);
exports.dynaFetch = dynaFetch_1.dynaFetch;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = __webpack_require__(2);
var defaultDynaFetchParams = {
    timeout: 0,
    retryMaxTimes: 0,
    retryTimeout: 0,
    onRetry: function () { return undefined; },
};
exports.dynaFetch = function (url, fetchParams, dynaFetchParams_) {
    if (fetchParams === void 0) { fetchParams = {}; }
    if (dynaFetchParams_ === void 0) { dynaFetchParams_ = {}; }
    var dynaFetchParams = __assign({}, defaultDynaFetchParams, dynaFetchParams_);
    var aborted = false;
    var timeoutTimer;
    var failedTimes = 0;
    var reject_;
    var debugInfo;
    var output = new Promise(function (resolve, reject) {
        reject_ = reject;
        debugInfo = { url: url, fetchParams: fetchParams, dynaFetchParams: dynaFetchParams_, failedTimes: failedTimes };
        var callFetch = function () {
            fetch(url, fetchParams)
                .then(function (response) {
                if (aborted)
                    return;
                if (timeoutTimer)
                    clearTimeout(timeoutTimer);
                resolve(response);
            })
                .catch(function (error) {
                if (aborted)
                    return;
                if (timeoutTimer)
                    clearTimeout(timeoutTimer);
                failedTimes++;
                if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
                    dynaFetchParams.onRetry && dynaFetchParams.onRetry();
                    setTimeout(function () { return callFetch(); }, dynaFetchParams.retryTimeout);
                }
                else {
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
                    if (aborted)
                        return;
                    if (timeoutTimer)
                        clearTimeout(timeoutTimer);
                    failedTimes++;
                    if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
                        dynaFetchParams.onRetry && dynaFetchParams.onRetry();
                        setTimeout(function () { return callFetch(); }, dynaFetchParams.retryTimeout);
                    }
                    else {
                        aborted = true;
                        reject({
                            code: 5017,
                            section: 'dynaFetch',
                            message: 'timeout error',
                            data: debugInfo,
                        });
                    }
                }, dynaFetchParams.timeout);
            }
        };
        callFetch();
    });
    output.abort = function () {
        if (timeoutTimer)
            clearTimeout(timeoutTimer);
        aborted = true;
        reject_({
            code: 5019,
            section: 'dynaFetch',
            message: 'abort',
            data: debugInfo,
        });
    };
    return output;
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("isomorphic-fetch");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});