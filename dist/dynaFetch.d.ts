import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IError } from "dyna-interfaces";
export { AxiosRequestConfig, AxiosResponse, IError, };
export interface IDynaFetchParams {
    timeout?: number;
    retryMaxTimes?: number;
    retryTimeout?: number;
    timeoutRandomFactor?: number;
    onRetry?: () => void;
}
export interface IDynaFetch extends Promise<AxiosResponse> {
    abort?: () => void;
}
export declare const dynaFetch: <TData>(url: string, axiosRequestConfig?: AxiosRequestConfig, dynaFetchParams_?: IDynaFetchParams) => IDynaFetch;
