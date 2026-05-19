import { Injectable } from '@angular/core';

import { App, AppList } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private _apps: App[] = [];
    private _config: { [key: string]: any } = {};

    get apps(): App[] {
        return this._apps;
    }

    get domain(): string {
        return this._config['domain'] || '';
    }

    get apiUrl(): string {
        return this._config['apiUrl'] || '';
    }

    get applicationTitle(): string {
        return this._config['applicationTitle'] || '';
    }

    get applicationEnglish(): string {
        return this._config['applicationEnglish'] || '';
    }

    init(config: { [key: string]: string }): void {
        this._config = config;
    }

    initApps(apps: App[]) {
        this._apps = apps;
    }

    hasApp(app: App): boolean {
        return AppList.includes(app) && this._apps.includes(app);
    }

    getApiUrl(path?: string): string {
        const url: string = this.apiUrl + (this.apiUrl.substring(this.apiUrl.length - 1) === '/' ? '' : '/');
        path = path ? (path.substring(0, 1) !== '/' ? path : path.substring(1)) : '';
        return url + path;
    }
}
