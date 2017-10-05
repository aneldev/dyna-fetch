import * as fetch from 'isomorphic-fetch';
import {IError} from "dyna-interfaces";

export interface IDynaFetchParams {
  timeout?: number;         // in ms
  retryMaxTimes?: number;
  retryTimeout?: number;    // in ms
  onRetry?: () => void;
}

export interface IDynaFetch extends Promise<Response> {
  abort?: () => void;
}

const defaultDynaFetchParams: IDynaFetchParams = {
  timeout: 0,
  retryMaxTimes: 0,
  retryTimeout: 3000,
  onRetry: () => undefined,
};

export {IError};

export const dynaFetch = (url: string, fetchParams: RequestInit = {}, dynaFetchParams_: IDynaFetchParams = {}): IDynaFetch => {
  const dynaFetchParams: IDynaFetchParams = {
    ...defaultDynaFetchParams,
    ...dynaFetchParams_,
  };
  let aborted: boolean = false;
  let timeoutTimer: any;
  let failedTimes: number = 0;
  let reject_: (error: IError)=>void;
  let debugInfo: any;

  const output: IDynaFetch = new Promise((resolve: (response: Response) => void, reject: (error: IError) => void) => {
    reject_ = reject;
    debugInfo = {url, fetchParams, dynaFetchParams: dynaFetchParams_, failedTimes};

    const callFetch = () => {

      fetch(url, fetchParams)

        .then((response: Response) => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          resolve(response);
        })

        .catch((error: any) => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);

          failedTimes++;

          if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
            dynaFetchParams.onRetry && dynaFetchParams.onRetry();
            setTimeout(() => callFetch(), dynaFetchParams.retryTimeout);
          }
          else {
            reject({
              code: 5007,
              message: 'general fetch network error (see the error property)',
              data: debugInfo,
              error
            });
          }

        });

      if (dynaFetchParams.timeout) {
        timeoutTimer = setTimeout(() => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          failedTimes++;

          if (dynaFetchParams.retryMaxTimes && failedTimes <= dynaFetchParams.retryMaxTimes) {
            dynaFetchParams.onRetry && dynaFetchParams.onRetry();
            setTimeout(() => callFetch(), dynaFetchParams.retryTimeout);
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

  output.abort = () => {
    if (timeoutTimer) clearTimeout(timeoutTimer);
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
