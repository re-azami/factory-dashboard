import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { App } from '@lib/shared';

import { IInitConfig } from './init.interface';
import { InitService } from './init.service';

const initApp = (initService: InitService): (() => Promise<void>) => {
    return async () => {
        await initService.checkToken();

        await initService.loadConfig();
        await initService.loadSetting();
        await initService.checkUser();
    };
};

@NgModule({
    providers: [
        InitService,
        { provide: APP_INITIALIZER, useFactory: initApp, deps: [InitService], multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class InitModule {
    static forRoot(app: 'ADMIN' | App, apiVersion: string, appVersion: string): ModuleWithProviders<InitModule> {
        const config: IInitConfig = { app, apiVersion, appVersion };
        return {
            ngModule: InitModule,
            providers: [{ provide: 'INIT_CONFIG', useValue: config }],
        };
    }
}
