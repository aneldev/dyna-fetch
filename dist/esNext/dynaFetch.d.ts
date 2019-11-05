import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IError } from "dyna-interfaces";
export interface IDynaFetchConfig {
    url: string;
    requestConfig?: AxiosRequestConfig;
    preFlight?: boolean;
    retry?: (error: AxiosError) => boolean;
    retryMaxTimes?: number;
    retryTimeout?: number;
    retryRandomFactor?: number;
    onRetry?: () => void;
}
export interface IDynaFetchHandler extends Promise<AxiosResponse> {
    abort: () => void;
    cancel: (message?: string) => void;
}
export { AxiosRequestConfig, AxiosResponse, IError, };
export declare const dynaFetch: <TData>(dynaFetchConfig: string | IDynaFetchConfig) => IDynaFetchHandler;
