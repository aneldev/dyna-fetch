"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var dyna_loops_1 = require("dyna-loops");
var defaultDynaFetchParams = {
    url: "",
    requestConfig: {},
    preFlight: false,
    retry: function () { return true; },
    cancelOnRetry: false,
    retryTimeout: 0,
    retryMaxTimes: 0,
    retryRandomFactor: undefined,
    onRetry: function () { return undefined; },
};
exports.dynaFetch = function (dynaFetchConfig) {
    var _a = __assign({}, defaultDynaFetchParams, (typeof dynaFetchConfig === "string"
        ? { url: dynaFetchConfig }
        : dynaFetchConfig)), userUrl = _a.url, requestConfig = _a.requestConfig, preFlight = _a.preFlight, retry = _a.retry, retryTimeout = _a.retryTimeout, retryMaxTimes = _a.retryMaxTimes, retryRandomFactor = _a.retryRandomFactor, cancelOnRetry = _a.cancelOnRetry, onRetry = _a.onRetry;
    var aborted = false;
    var timeoutTimer;
    var failedTimes = 0;
    var reject_;
    var cancelFunction;
    var cancelRequested = false;
    var cancelRequestedMessage;
    var getDelay = function () {
        return retryRandomFactor === undefined
            ? retryTimeout
            : retryTimeout * (dyna_loops_1.random(0, retryRandomFactor * 100) / 100);
    };
    var url = userUrl || (requestConfig && requestConfig.url) || userUrl;
    var output = new Promise(function (resolve, reject) {
        reject_ = reject;
        var callFetch = function () {
            Promise.resolve()
                .then(function () {
                if (preFlight) {
                    return axios_1.default.request({
                        url: url,
                        method: "OPTIONS",
                        headers: {
                            "Access-Control-Request-Method": requestConfig.method || "GET",
                            "Access-Control-Request-Headers": "origin, x-requested-with",
                            "Origin": location.href,
                        },
                    });
                }
                else {
                    return Promise.resolve();
                }
            })
                .then(function () {
                return axios_1.default.request(__assign({}, requestConfig, { url: url, cancelToken: new axios_1.default.CancelToken(function (c) {
                        cancelFunction = c;
                        if (cancelRequested)
                            cancelFunction(cancelRequestedMessage);
                    }) }));
            })
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
                if (error.message === 'Canceled-due-to-dynaFetch-retry-093587082460248546')
                    return;
                if (timeoutTimer)
                    clearTimeout(timeoutTimer);
                failedTimes++;
                if (retry(error) && retryMaxTimes && failedTimes <= retryMaxTimes) {
                    onRetry && onRetry();
                    timeoutTimer = setTimeout(function () { return callFetch(); }, getDelay());
                }
                else {
                    reject(error);
                }
            });
            if (retryTimeout) {
                timeoutTimer = setTimeout(function () {
                    if (aborted)
                        return;
                    if (timeoutTimer)
                        clearTimeout(timeoutTimer);
                    failedTimes++;
                    if (retryMaxTimes && failedTimes <= retryMaxTimes) {
                        onRetry && onRetry();
                        if (cancelOnRetry)
                            cancelFunction('Canceled-due-to-dynaFetch-retry-093587082460248546');
                        timeoutTimer = setTimeout(function () { return callFetch(); }, getDelay());
                    }
                    else {
                        aborted = true;
                        reject({
                            code: 5017,
                            section: 'dynaFetch',
                            message: 'Client request timeout error',
                        });
                    }
                }, getDelay());
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
            message: 'Aborted',
        });
    };
    output.cancel = function (message) {
        if (cancelFunction)
            cancelFunction(message);
        else {
            cancelRequested = true;
            cancelRequestedMessage = message;
        }
    };
    return output;
};
//# sourceMappingURL=dynaFetch.js.map