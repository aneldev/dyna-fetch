import {dynaFetch, IDynaFetchHandler} from "../../src";
import {IError} from "dyna-interfaces";
import {AxiosResponse} from "../../src";

declare let jasmine: any, describe: any, expect: any, it: any;
if (typeof jasmine !== 'undefined') jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

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
    let fetchClients: IDynaFetchHandler = dynaFetch({
      url: 'https://httpstat.us/200?sleep=3000',
      retryTimeout: 1000,
    });
    fetchClients
      .then((response: AxiosResponse) => {
        expect(response).toBe(undefined);
        done();
      })
      .catch((error: IError) => {
        expect(error.code).toBe(5019);
        done();
      });
    fetchClients.abort();
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
        expect(error.code).toBe(5017);
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
        expect(error.code).toBe(5017);
        expect(retried).toBe(3);
        expect(error.error).toBe(undefined);
        done();
      });
  });

  it('should not fetch because of bad address with 3 retries', (done: Function) => {
    let retried: number = 0;
    let started: Date = new Date();
    dynaFetch( {
      url: 'http://www.987609234624-x-5245245.com',
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
        expect(error.code).toBe(5007);
        expect(Number(ended) - Number(started) > 600).toBe(true);
        expect(error.error).not.toBe(undefined);
        done();
      });
  });

});
