import { HttpInterceptorFn } from '@angular/common/http';

/**
 * No-op stub. Reserved for later normalization of Date headers / payload
 * timestamps once the backend wiring lands. Keep registered so adding logic
 * later requires no module changes.
 */
export const dateInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req);
};
