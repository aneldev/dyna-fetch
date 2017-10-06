# About

`dyna-fetch` wrapps the [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) and adds some sugar on it like:

- timeout
- retry
- abort*

Written in Typescript, it is universal and runs everywhere (in Typescript or Javascript).

# Signature

**dynaFetch(url: string, fetchParams: RequestInit = {}, dynaFetchParams: IDynaFetchParams = {}): IDynaFetch**

The `IDynaFetch` interface is actually a `Promise<Response>` extended with only one method, the `abort` _see later in this text_.

## fetchParams

Are the `fetch` params, check [here](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) for more.

## dynaFetchParams

Are params supported by the `dyna-fetch`, see [here](#idynafetchparams) for more.

# Usage
```
import {dynaFetch} from 'dyna-fetch';

dynaFetch('https://example.com/api?client=3002', 
	{
		// the parameters of the isomorphic-fetch
		// see at: https://github.com/matthew-andrews/isomorphic-fetch
	}, 
	{
	  timeout: 20000,		// wait for max 20 seconds
	  retryMaxTimes: 3,		// retry max 3 times
	  retryTimeout: 1000,	// wait for 1sec for each retry
	  onRetry: () => console.log('retrying...'),
	}
)
.then((response: Response) => {
	// this is the response object of isomorphic-fetch
})
.catch((error: IError) => {
	// error.error is the isomorphic-fetch's error (if the error came from it)
});

```

# Features

## Timeout

In case of timeout, the Promise will be rejected.

**Example:**

```
import {dynaFetch} from 'dyna-fetch';

dynaFetch('https://example.com/api?client=3002', 
	{
		// the parameters of the isomorphic-fetch
	}, 
	{
	  timeout: 20000,		// wait for max 20 seconds
	}
)
.then((response: Response) => {
	// this is the response object of isomorphic-fetch
})
.catch((error: IError) => {
	// is case of timeout error, the error.code will be 5019
});
```

## Retry

If case of network fail, or of timeout, the fetch will be retried. If the tries exceed the `retryMaxTimes` then the Promise will be rejected.

**Example:**

```
import {dynaFetch} from 'dyna-fetch';

dynaFetch('https://example.com/api?client=3002', 
	{
		// the parameters of the isomorphic-fetch
	}, 
	{
	  retryMaxTimes: 3,		// retry max 3 times
	  retryTimeout: 1000,	// wait for 1sec for each retry
	  onRetry: () => console.log('retrying...'),
	}
)
.then((response: Response) => {
	// this is the response object of isomorphic-fetch
})
.catch((error: IError) => {
	// if after 3 retries the request failed again, the error.code will be 5007
	// the error.error is the isomorphic-fetch's error (if the error came from it)
});

```

## Abort*

The `fetch` yet doesn't support the `abort` feature, for more [read here](https://github.com/whatwg/fetch/issues/27).

`dynaFetch` provides the `abort` method as result of `dynaFetch()` but the only that it is doing is that rejects the Promise. If you `post` and you `abort()` your `post` might be posted! 

> For the future, a Cancelable promise looks promising.

**Example:**

```
import {dynaFetch} from 'dyna-fetch';

const fetchClients: IDynaFetch = dynaFetch('https://example.com/api?clientsGroup=3200');

fetchClients
	.then((response: Response) => {
		// consule the response here
	})
	.catch((error: IError) => {
		// this will be called with error.code 5019
	});
  
fetchClients.abort();
```

# Errors

## error.code 5007

In `error.error` is the error of the `isomorphic-fetch`. You should check this to get the network error.

## error.code 5017

In case of timeout.

## error.code 5019

In case of `abort()` call.

# Interfaces

## IDynaFetch

```
interface IDynaFetch extends Promise<Response> {
  abort?: () => void;
}
```

## IDynaFetchParams
```
interface IDynaFetchParams {
  timeout?: number;         // in ms, when the fetch will fail
  retryMaxTimes?: number;	// how many times should retry (defalut = 1)
  retryTimeout?: number;    // in ms, retry after a timeout (after a network fail or timeout fail)
  onRetry?: () => void;		// callback in case of retry
}
```

## IError

```
interface IError {
  code?: number | string; // code
  section?: string;       // section of the application (dynaFetch in this case)
  message?: string;       // a meaningful dev/debug message
  data?: any;             // the arguments where the dynaFetch called
  error?: any;            // nested error
}
```
