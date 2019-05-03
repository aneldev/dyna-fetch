import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {random} from "dyna-loops";
import {IError} from "dyna-interfaces";

export interface IDynaFetchConfig {
  url: string;
  requestConfig?: AxiosRequestConfig;         // help: https://github.com/axios/axios#axios-api
  preFlight?: boolean;                        // default: false, skip CORS with pre-flight OPTIONS request (the server should support this)
  retry?: (error: AxiosError) => boolean;     // default: () => true; Validate the error. Return true to retry or false to return the error.
  retryMaxTimes?: number;                     // default: 0
  retryTimeout?: number;                      // default: 0, in ms
  retryRandomFactor?: number;                 // default is 1, finalTimeout = retryTimeout * random(0, timeoutRandomFactor)
  onRetry?: () => void;                       // callback called on each retry
}

const defaultDynaFetchParams: IDynaFetchConfig = {
  url: "",
  requestConfig: {},
  preFlight: false,
  retry: () => true,
  retryTimeout: 0,
  retryMaxTimes: 0,
  retryRandomFactor: undefined,
  onRetry: () => undefined,
};

export interface IDynaFetchHandler extends Promise<AxiosResponse> {
  abort: () => void;
}

export {
  AxiosRequestConfig,
  AxiosResponse,
  IError,
};

interface IDynaFetchConfigWorking {
  url: string;
  requestConfig: AxiosRequestConfig;
  preFlight: boolean;
  retry: (error: AxiosError) => boolean;
  retryMaxTimes: number;
  retryTimeout: number;
  retryRandomFactor: number;
  onRetry: () => void;
}

export const dynaFetch = <TData>(dynaFetchConfig: IDynaFetchConfig | string): IDynaFetchHandler => {
  const {
    url: userUrl,
    requestConfig,
    preFlight,
    retry,
    retryTimeout,
    retryMaxTimes,
    retryRandomFactor,
    onRetry,
  } = {
    ...defaultDynaFetchParams,
    ...(typeof dynaFetchConfig === "string"
        ? {url: dynaFetchConfig}
        : dynaFetchConfig as IDynaFetchConfig
    ),
  } as IDynaFetchConfigWorking;

  let aborted: boolean = false;
  let timeoutTimer: any;
  let failedTimes: number = 0;
  let reject_: (error: IError)=>void;

  const getDelay = (): number =>
    retryRandomFactor === undefined
      ? retryTimeout
      : retryTimeout * (random(0, retryRandomFactor * 100) / 100);

  const url: string = userUrl || (requestConfig && requestConfig.url) || userUrl;

  const output = new Promise((resolve: (response: AxiosResponse) => void, reject: (error: IError) => void) => {
    reject_ = reject;

    const callFetch = () => {

      Promise.resolve()

        .then(() => {
          if (preFlight) {
            return axios.request<TData>({
              url,
              method: "OPTIONS",
              headers: {
                "Access-Control-Request-Method": requestConfig.method || "GET",
                "Access-Control-Request-Headers": "origin, x-requested-with",
                "Origin": location.href,
              },
            })
          }
          else {
            return Promise.resolve() as any;
          }
        })

        .then(() => {
          return axios.request<TData>({
            ...requestConfig,
            url,
          })
        })

        .then((response) => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          resolve(response);
        })

        .catch((error: AxiosError) => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);

          failedTimes++;

          if (retry(error) && retryMaxTimes && failedTimes <= retryMaxTimes) {
            onRetry && onRetry();
            timeoutTimer = setTimeout(() => callFetch(), getDelay());
          }
          else {
            reject(error);
          }

        });

      if (retryTimeout) {
        timeoutTimer = setTimeout(() => {
          if (aborted) return;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          failedTimes++;

          if (retryMaxTimes && failedTimes <= retryMaxTimes) {
            onRetry && onRetry();
            timeoutTimer = setTimeout(() => callFetch(), getDelay());
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

  (output as IDynaFetchHandler).abort = () => {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    aborted = true;

    reject_({
      code: 5019,
      section: 'dynaFetch',
      message: 'Aborted',
    });
  };

  return output as IDynaFetchHandler;
};

