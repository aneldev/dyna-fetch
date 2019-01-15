import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {IError} from "dyna-interfaces";

export {
  AxiosRequestConfig, AxiosResponse,
  IError,
};

export interface IDynaFetchParams {
  timeout?: number;         // in ms
  retryMaxTimes?: number;
  retryTimeout?: number;    // in ms
  timeoutRandomFactor?: number;    // default is 1, finalTimeout = retryTimeout * random(0, timeoutRandomFactor)
  onRetry?: () => void;
}

export interface IDynaFetch extends Promise<AxiosResponse> {
  abort?: () => void;
}

const defaultDynaFetchParams: IDynaFetchParams = {
  timeout: 0,
  retryMaxTimes: 0,
  retryTimeout: 0,
  onRetry: () => undefined,
};

export const dynaFetch = <TData>(url: string, axiosRequestConfig: AxiosRequestConfig = {}, dynaFetchParams_: IDynaFetchParams = {}): IDynaFetch => {
  const dynaFetchParams: IDynaFetchParams = {
    ...defaultDynaFetchParams,
    ...dynaFetchParams_,
  };
  let aborted: boolean = false;
  let timeoutTimer: any;
  let failedTimes: number = 0;
  let reject_: (error: IError)=>void;
  let debugInfo: any;

  const output: IDynaFetch = new Promise((resolve: (response: AxiosResponse) => void, reject: (error: IError) => void) => {
    reject_ = reject;
    debugInfo = {url, fetchParams: axiosRequestConfig, dynaFetchParams: dynaFetchParams_, failedTimes};

    const callFetch = () => {

      axios.request<TData>({
        ...axiosRequestConfig,
        url: url || axiosRequestConfig.url,
      })

        .then((response) => {
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
