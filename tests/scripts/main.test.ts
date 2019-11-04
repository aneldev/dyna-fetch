import "jest";
import {IError} from "dyna-interfaces";

import {dynaFetch, IDynaFetchHandler, AxiosResponse} from "../../src";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

// help: https://facebook.github.io/jest/docs/expect.html

describe('dynaFetch test', () => {
  it('should fetch something from google.com', (done: Function) => {
    dynaFetch('http://www.google.com')
      .then((response: AxiosResponse) => {
        expect(response).not.toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error).toBe(undefined);
        done();
      });
  });

  it('should fetch json object', (done: Function) => {
    dynaFetch('https://jsonplaceholder.typicode.com/posts/1')
      .then((response: AxiosResponse) => {
        expect(typeof response.data).toBe('object');
        done();
      })
      .catch((error: IError) => {
        expect(error).toBe(undefined);
        done();
      });
  });

  it('should not fetch because of abort method call', (done: Function) => {
    const fetch: IDynaFetchHandler = dynaFetch({
      url: 'https://httpstat.us/200?sleep=3000',
      retryTimeout: 1000,
    });
    fetch
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error.message).toBe("Aborted");
        done();
      });
    fetch.abort();
  });

  it('should not fetch because of timeout', (done: Function) => {
    dynaFetch({
      url: 'https://httpstat.us/200?sleep=3000',
      retryTimeout: 1000,
    })
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error.message).toBe("Client request timeout error");
        done();
      });
  });

  it('should not fetch because of timeout but with 3 retries', (done: Function) => {
    let retried: number = 0;
    dynaFetch( {
      url: 'https://httpstat.us/200?sleep=3000',
      retryTimeout: 400,
      retryMaxTimes: 3,
      onRetry: () => retried++,
    })
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error.message).toBe("Client request timeout error");
        expect(retried).toBe(3);
        done();
      });
  });

  it('should cancel the request immediately', (done: Function) => {
    const fetch = dynaFetch({
      url: 'https://httpstat.us/200?sleep=4000',
    });
    fetch
      .then((response: AxiosResponse) => {
        fail({
          message: 'Response was unexpected',
          response,
        });
      })
      .catch((error: IError) => {
        expect(error.message).toBe('Fetch canceled')
      })
      .then(() => done());
    fetch.cancel('Fetch canceled');
  });

  it('should cancel the request after 1sec', (done: Function) => {
    const fetch = dynaFetch({
      url: 'https://httpstat.us/200?sleep=4000',
    });
    fetch
      .then((response: AxiosResponse) => {
        fail({
          message: 'Response was unexpected',
          response,
        });
      })
      .catch((error: IError) => {
        expect(error.message).toBe('Fetch canceled')
      })
      .then(() => done());
    setTimeout(()=>{
      fetch.cancel('Fetch canceled');
    },1000);
  });

  it('should not fetch because of bad address with 3 retries', (done: Function) => {
    let retried: number = 0;
    let started: Date = new Date();
    dynaFetch( {
      url: 'http://www.INVALID-ADDESS-987609234624-x-5245245.com',
      retryMaxTimes: 3,
      retryTimeout: 200,
      onRetry: () => retried++,
    })
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        let ended: Date = new Date();
        expect(error).not.toBe(undefined);
        expect(Number(ended) - Number(started) > 600).toBe(true);
        expect(retried).toBe(3);
        done();
      });
  });

  it('should not fetch because of bad address with 2 retries with retry()=>false on 2nd', (done: Function) => {
    let retried: number = 0;
    dynaFetch({
      url: 'http://www.INVALID-ADDESS-987609234624-x-5245245.com',
      retryMaxTimes: 3,
      retryTimeout: 200,
      retry: () => retried < 2,
      onRetry: () => retried++,
    })
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error).not.toBe(undefined);
        expect(retried).toBe(2);
        done();
      });
  });

});
