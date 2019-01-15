import { IError } from "dyna-interfaces";
export interface IDynaFetchParams {
    timeout?: number;
    retryMaxTimes?: number;
    retryTimeout?: number;
    onRetry?: () => void;
}
export interface IDynaFetch extends Promise<Response> {
    abort?: () => void;
}
export { IError };
export declare const dynaFetch: (url: string, fetchParams?: RequestInit, dynaFetchParams_?: IDynaFetchParams) => IDynaFetch;
