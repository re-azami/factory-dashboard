import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperModule } from '@webilix/ngx-helper';

import { ApiModule } from '@lib/apis';
import { InitModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { AppVersions } from './app.version';

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

        InitModule.forRoot('ADMIN', AppVersions.api, AppVersions.app),
        ApiModule,
        PageModule,

        AppRoutingModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
