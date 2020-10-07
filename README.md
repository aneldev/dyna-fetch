# About

`dyna-fetch` wrapps the [axios](https://github.com/axios/axios) and adds some sugar on it like:

- pre-flight to bypass CORS
- timeout
- cancel
- retry
- abort

Written in Typescript, it is universal and runs everywhere browser/nodeJs/.

# Usage
```
import {dynaFetch} from 'dyna-fetch';

const myRequest = dynaFetch({
    url: 'https://example.com/api?client=3002',
    preFlight: true,        // (optional) try to bypass CORS
    timeout: 20000,         // (optional) wait for max 20 seconds
    retryMaxTimes: 3,       // (optional) retry max 3 times
    retryTimeout: 1000,     // (optional) wait for 1sec for each retry
    retryRandomFactor: 1,   // (optional) timeout factor
    onRetry: () => console.log('retrying...'), // (optional) 
});

myRequest
    .then((response: AxiosResponse) => {
        // ...
    })
    .catch((error: IError | AxiosError) => {
        // ...
    });

// later you can abort it, rejects the promise
myRequest.abort();

// later you can cancel it, rejects the promise
myRequest.cancel('Fetch is canceled');

```

# Arguments

```
interface IDynaFetchConfig {
  url: string;
  requestConfig?: AxiosRequestConfig;         // help: https://github.com/axios/axios#axios-api
  preFlight?: boolean;                        // default: false, skip CORS with pre-flight OPTIONS request (the server should support this)
  retry?: (error: AxiosError) => boolean;     // default: () => true; Validate the error. Return true to retry or false to return the error.
  cancelOnRetry?: boolean;                    // default: false; if true, in case of retry timeout the current request will be XHR canceled.
  retryMaxTimes?: number;                     // default: 0
  retryTimeout?: number;                      // default: 0, in ms
  retryRandomFactor?: number;                 // default is 1, finalTimeout = retryTimeout * random(0, timeoutRandomFactor)
  onRetry?: () => void;                       // callback called on each retry
}
```

# dynaFetch API

The `dynaFetch()` returns a promise object together with a small API object.

TS the type of th result is `IDynaFetchHandler`.

```
{
  abort: () => void;
  cancel: (message?: string) => void;
}
```

## Abort

During the execution of the request, you can abort the request.

**Note**: The request is not a cancelled! The abort just swallows the response and rejects the promise.

## Cancel

Cancel the XHR request.

Cancel rejects the promise.

# Errors

In case of a rejected request, if the error has to do with features of the `dyna-fetch`, the `IError` will be returned.

Otherwise, the `axios`'s error will be returned.

## IError

```
interface IError {
  code?: number | string; // code
  section?: string;       // section of the application (dynaFetch in this case)
  message?: string;       // a meaningful dev/debug message
  error?: any;            // nested error
}
```

## error.code 5017

In case of timeout.

## error.code 5019

In case of `abort()` call.

# Change log

## v1.0.0

- Working with [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
- Retry feature

## v2.0.0

- Working with [axios](https://github.com/axios/axios)
- Pre-flight requests with CORS
- Retry with random factor

## v3.0.0

- New prop `retry?: (error: AxiosError) => boolean;`. Validate the error to retry or not.
- The returned error is not an IError that wraps the AxiosError but the AxiosError directly. Still the IError returned on 5017 & 5019.

## v3.1.0

- Cancel request on demand
- Cancel request on retry

## v3.1.2

- Cancel request on retry only then the `cancelOnRetry: true` config prop
