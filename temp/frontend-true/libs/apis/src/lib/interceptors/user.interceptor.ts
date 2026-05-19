import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

import { UserService } from '@lib/providers';
import { Storages } from '@lib/shared';

import { IUserInfoRs } from '../rq-rs';
import { IApiException, IApiResponse } from '../api.interface';
import { ApiService } from '../api.service';

export const UserInterceptor: HttpInterceptorFn = (request, next) => {
    const apiService = inject(ApiService);
    const userService = inject(UserService);

    const isSettingRequest = (response: IApiResponse | IApiException): boolean => {
        if (!response?.request?.path || response?.request?.method !== 'GET') return false;

        const path: string[] = response.request.path.split('/').filter((r: string) => r !== '');
        return path.length === 1 && path[0].toLowerCase() === 'setting';
    };

    const isUserRequest = (response: IApiResponse | IApiException): boolean => {
        if (!response?.request?.path || response?.request?.method !== 'GET') return false;

        const path: string[] = response.request.path.split('/').filter((r: string) => r !== '');
        const userRequest: boolean = path.length === 1 && path[0].toLowerCase() === 'user';

        if (userRequest && response?.user?.update)
            sessionStorage.setItem(Storages.USER_UPDATE, response.user.update.toString());
        return userRequest;
    };

    const isUpdated = (response: IApiResponse | IApiException): boolean => {
        if (!response?.user?.update) return false;

        const update = +(sessionStorage.getItem(Storages.USER_UPDATE) || '0');
        return !!update && !isNaN(update) && update !== response.user.update;
    };

    return next(request).pipe(
        tap((event) => {
            if (!(event instanceof HttpResponse)) return;

            const body = event.body as IApiResponse | IApiException;
            if (isSettingRequest(body) || isUserRequest(body) || !isUpdated(body)) return;

            apiService.request<IUserInfoRs>('UserInfo', { loading: false, silent: true }, (response) =>
                userService.initUser(response.user),
            );
        }),
    );
};
