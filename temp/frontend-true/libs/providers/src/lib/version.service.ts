import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { App } from '@lib/shared';

export interface IVersion {
    build: string;
    apiVersion: string;
    appVersion: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
    private _app?: 'ADMIN' | App;
    get app(): 'ADMIN' | App | undefined {
        return this._app;
    }

    private _frontend?: IVersion;
    get frontend(): IVersion | undefined {
        return this._frontend;
    }

    private _backend?: IVersion;
    get backend(): IVersion | undefined {
        return this._backend;
    }

    private versionChanged: Subject<boolean> = new Subject<boolean>();
    get onVersionChanged(): Observable<boolean> {
        return this.versionChanged.asObservable();
    }

    initFrontend(build: string, apiVersion: string, appVersion: string): void {
        if (!apiVersion || !appVersion) return;
        this._frontend = { build, apiVersion, appVersion };
    }

    initBackend(app: 'ADMIN' | App, build: string, versions: { [key: string]: string }): void {
        const apiVersion = versions['api'];
        const appVersion = versions[app.toLocaleLowerCase()];
        if (!app || !apiVersion || !appVersion) return;

        this._app = app;
        this._backend = { build, apiVersion, appVersion };
    }

    updateBackend(build: string, versions: { [key: string]: string }): void {
        if (!this._app || !this._frontend || !this._backend) return;

        const apiVersion = versions['api'];
        const appVersion = versions[this._app.toLocaleLowerCase()];
        if (!apiVersion || !appVersion) return;
        if (apiVersion === this._backend.apiVersion && appVersion === this._backend.appVersion) return;

        this._backend = { build, apiVersion, appVersion };
        this.versionChanged.next(this.isUpdated());
    }

    isUpdated(): boolean {
        if (!this._app || !this._frontend || !this._backend) return false;

        // Check API Version
        if (this._frontend.apiVersion !== this._backend.apiVersion) return true;

        // Check APP Version
        if (this._frontend.appVersion !== this._backend.appVersion) return true;

        return false;
    }
}
