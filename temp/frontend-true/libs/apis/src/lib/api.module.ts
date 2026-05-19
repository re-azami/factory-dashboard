import { NgModule } from '@angular/core';
import { withInterceptors, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ApiService } from './api.service';

import { RequestInterceptor } from './interceptors/request.interceptor';
import { UserInterceptor } from './interceptors/user.interceptor';

@NgModule({
    providers: [
        ApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClient(withInterceptors([RequestInterceptor, UserInterceptor])),
    ],
})
export class ApiModule {}
