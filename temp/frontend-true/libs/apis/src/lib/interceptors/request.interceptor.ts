import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { VersionService } from '@lib/providers';

import { Storages } from '@lib/shared';

export const RequestInterceptor: HttpInterceptorFn = (request, next) => {
    const token: string = localStorage.getItem(Storages.USER_TOKEN) || '';

    const versionService = inject(VersionService);
    const version: string = JSON.stringify({
        app: versionService.app || null,
        version: versionService.frontend?.appVersion || null,
        build: versionService.frontend?.build || null,
    });

    const headers: HttpHeaders = request.headers.set('Authorization', `Bearer ${token}`).set('X-Version', version);
    return next(request.clone({ headers }));
};
