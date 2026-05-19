import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Helper } from '@webilix/helper-library';
import { NGX_HELPER_LOADING_HEADER, NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ConfigService, UserService, VersionService } from '@lib/providers';
import { Upload, UploadInfo } from '@lib/shared';

import { ApiTypes, ApiTypesInfo } from './api.type';
import { IApiConfig, IApiError, IApiException, IApiInfo, IApiResponse } from './api.interface';
import { IUploadRq, IUploadRs } from './rq-rs/upload';

@Injectable()
export class ApiService {
    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly versionService: VersionService,
    ) {}

    private apiIndex: number = 0;

    private getUrl(path: string, ids: { [key: string]: string }): string {
        let url: string = path.indexOf('://') === -1 ? this.configService.apiUrl : '';
        while (url.substring(url.length - 1) === '/') url = url.substring(0, url.length - 1);
        url = url + path;

        Object.keys(ids).forEach((i: string) => (url = url.replace(`/:${i}`, `/${ids[i]}`)));
        return url;
    }

    private checkRequest(info: IApiInfo, ids: { [key: string]: string }, params: { [key: string]: any }): string[] | null {
        const errors: string[] = [];

        // IDS
        info.path.split('/').forEach((p: string) => {
            if (p.substring(0, 1) === ':' && Helper.IS.empty(ids[p.substring(1)]))
                errors.push(`مقدار شناسه ${p.substring(1)} مشخص نشده است.`);
        });
        Object.keys(ids).forEach((i: string) => {
            if (info.path.indexOf(`/:${i}`) === -1) errors.push(`شناسه ${i} در آدرس ای‌پی‌آی وجود ندارد.`);
        });

        // PARAMS
        Object.keys(info.params || {}).forEach((p: string) => {
            if (info.params?.[p] === true && Helper.IS.empty(params[p])) errors.push(`مقدار پارامتر ${p} مشخص نشده است.`);
        });
        Object.keys(params).forEach((p: string) => {
            if (Helper.IS.empty(info.params?.[p])) errors.push(`پارامتر ${p} برای این ای‌پی‌آی تعریف نشده است.`);
        });

        return errors.length === 0 ? null : errors;
    }

    private handleError(status: number, errors: string[], silent: boolean): IApiError {
        if (!silent) this.ngxHelperToastService.error(errors);
        return { status, errors };
    }

    public request<T>(type: ApiTypes): void;
    public request<T>(type: ApiTypes, onSuccess: (response: T, index: number) => void): void;
    public request<T>(
        type: ApiTypes,
        onSuccess: (response: T, index: number) => void,
        onError: (error: IApiError) => void,
    ): void;
    public request<T>(type: ApiTypes, config: IApiConfig): void;
    public request<T>(type: ApiTypes, config: IApiConfig, onSuccess: (response: T, index: number) => void): void;
    public request<T>(
        type: ApiTypes,
        config: IApiConfig,
        onSuccess: (response: T, index: number) => void,
        onError: (error: IApiError) => void,
    ): void;
    public request<T>(type: ApiTypes, arg1?: any, arg2?: any, arg3?: any): void {
        const config: IApiConfig = typeof arg1 === 'object' ? arg1 : {};
        const onSuccess: (response: T, index: number) => void = !arg1
            ? () => {}
            : typeof arg1 === 'function'
            ? arg1
            : arg2 || (() => {});
        const onError: (error: IApiError) => void = arg3
            ? arg3
            : typeof arg1 === 'function' && typeof arg2 === 'function'
            ? arg2
            : () => {};

        const info: IApiInfo = ApiTypesInfo[type];
        const url: string = this.getUrl(info.path, config.ids || {});

        const errors: string[] | null = this.checkRequest(info, config.ids || {}, config.params || {});
        if (errors !== null) return onError(this.handleError(HttpStatusCode.BadRequest, errors, !!config.silent));

        const options: {
            headers: { [header: string]: string };
            params: { [param: string]: string };
            observe: 'response';
            responseType: 'json';
        } = {
            headers: { [NGX_HELPER_LOADING_HEADER]: config.loading === false ? 'N' : 'Y' },
            params: config.params || {},
            observe: 'response',
            responseType: 'json',
        };

        const headers: { [key: string]: string } = config.headers || {};
        Object.keys(headers).forEach((header: string) => (options.headers[header] = headers[header]));

        let request: Observable<HttpResponse<IApiResponse>>;
        switch (info.method) {
            case 'GET':
                request = this.http.get<IApiResponse>(url, options);
                break;
            case 'POST':
                request = this.http.post<IApiResponse>(url, config.body || {}, options);
                break;
            case 'PUT':
                request = this.http.put<IApiResponse>(url, config.body || {}, options);
                break;
            case 'PATCH':
                request = this.http.patch<IApiResponse>(url, config.body || {}, options);
                break;
            case 'DELETE':
                request = this.http.delete<IApiResponse>(url, options);
                break;
        }

        const index: number = ++this.apiIndex;
        request.subscribe({
            next: (response: HttpResponse<IApiResponse>) => {
                if (response.body?.apps) this.configService.initApps(response.body.apps);
                if (response.body?.versions) this.versionService.updateBackend(response.body.build, response.body.versions);

                onSuccess(response.body?.response, index);
            },
            error: (response: HttpErrorResponse) => {
                if (response.status === HttpStatusCode.Unauthorized && !config.silent) {
                    this.userService.signout();
                    this.router.navigate(['/']);

                    config.silent = true;
                }

                const exception: IApiException = response && response.error ? response.error : null;
                const errors: string[] = exception && exception.errors ? exception.errors : ['اشکال در دریافت اطلاعات'];
                onError(this.handleError(response.status, errors, !!config.silent));
            },
        });
    }

    public upload(type: Upload, file: File, onSuccess: (response: IUploadRs) => void): void {
        const info = UploadInfo[type];
        const url: string = this.getUrl('/upload', {});
        const body: IUploadRq = { type };

        const image: string[] = ['image/gif', 'image/jpeg', 'image/png'];
        const mimes: string[] | undefined = !info.mimes
            ? undefined
            : info.mimes === 'IMAGE'
            ? image
            : info.mimes.map((m) => (m === 'IMAGE' ? image : m)).flat();

        this.ngxHelperHttpService.upload<IApiResponse, IApiException>(
            file,
            url,
            { body, maxSize: info.maxSize || '10MB', mimes },
            (response) => onSuccess(response.response),
            (error) => {
                if (!error) return;

                if (error.status === 401) this.userService.signout();
                const errors: string[] =
                    error && error.error && error.error.errors ? error.error.errors : ['اشکال در دریافت اطلاعات'];
                this.ngxHelperToastService.error(errors);
            },
        );
    }
}
