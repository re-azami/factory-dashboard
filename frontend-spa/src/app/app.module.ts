import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperModule } from '@webilix/ngx-helper';
import { MARKED_OPTIONS, MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { loadingInterceptor } from './shared/interceptors/loading.interceptor';
import { dateInterceptor } from './shared/interceptors/date.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),

        NgxFormModule.forRoot(
            { appearance: 'fill', submitTimeout: 1, mobileWidth: 600 },
            {
                primaryColor: 'rgb(56, 77, 84)',
                borderColor: 'rgb(220, 220, 220)',
                backgroundColor: 'rgb(238, 242, 246)',
                iconSize: '18px !important',
            },
        ),
        NgxHelperModule.forRoot({
            style: {
                fontSize: '14px',
                primaryColor: 'rgb(56, 77, 84)',
                borderColor: 'rgb(220, 220, 220)',
                backgroundColor: 'rgb(238, 242, 246)',
                iconSize: '18px !important',
                dialogWidth: '500px',
            },
        }),
        MarkdownModule.forRoot({
            markedOptions: {
                provide: MARKED_OPTIONS,
                useValue: { gfm: true, breaks: false },
            },
        }),

        SharedModule,
        AppRoutingModule,
    ],
    providers: [provideHttpClient(withInterceptors([loadingInterceptor, dateInterceptor]))],
    bootstrap: [AppComponent],
})
export class AppModule {}
