import { HttpStatusCode } from '@angular/common/http';

import { App } from '@lib/shared';

export type ApiMethodTypes = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IApi {
    readonly build: string;
    readonly apps: App[];
    readonly versions: { [key: string]: string };
    readonly request: { readonly uuid: string; readonly method: string; readonly path: string };
    readonly timestamp: number;
    readonly user: { readonly id: string; readonly update: number; readonly alert: number };
}

export interface IApiResponse extends IApi {
    readonly response: any;
}

export interface IApiException extends IApi {
    readonly status: HttpStatusCode;
    readonly errors: string[];
}

export interface IApiInfo {
    readonly method: ApiMethodTypes;
    readonly path: string;
    readonly params?: { [key: string]: boolean };
}

export interface IApiConfig {
    body?: { [key: string]: any };
    ids?: { [key: string]: string };
    params?: { [key: string]: string };
    headers?: { [key: string]: string };
    loading?: boolean;
    silent?: boolean;
}

export interface IApiError {
    status: number;
    errors: string[];
}
