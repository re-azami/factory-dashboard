import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';

import { ApiTypesInfo, IApiException, IApiResponse, ISettingInfoRs, IUserInfoRs } from '@lib/apis';
import { ConfigService, SettingService, UserService, VersionService } from '@lib/providers';
import { Storages } from '@lib/shared';

import { IInitConfig } from './init.interface';

@Injectable()
export class InitService {
    private stop: boolean = false;

    constructor(
        @Optional() @Inject('INIT_CONFIG') private readonly config: IInitConfig,
        private readonly httpClient: HttpClient,
        private readonly configService: ConfigService,
        private readonly settingService: SettingService,
        private readonly userService: UserService,
        private readonly versionService: VersionService,
    ) {}

    checkToken(): Promise<void> {
        return new Promise<void>((resolve) => {
            try {
                const url: URL = new URL(document.location.href);
                const token: string | null = url.searchParams.get('token');
                if (!token) resolve();
                else {
                    localStorage.setItem(Storages.USER_TOKEN, token);
                    document.location.href = '/dashboard';
                }
            } catch (e) {
                resolve();
            }
        });
    }

    loadConfig(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.httpClient.get<{ [key: string]: string }>('./assets/config.json').subscribe({
                next: (config) => {
                    if (this.config && this.config.apiVersion && this.config.appVersion)
                        this.versionService.initFrontend(config['build'], this.config.apiVersion, this.config.appVersion);

                    this.configService.init(config);
                    const title: string = this.configService.applicationEnglish;
                    document.title = title ? `${title} :: ${this.config.app}` : this.config.app;

                    resolve(true);
                },
                error: () => {
                    this.stop = true;
                    resolve(false);
                },
            });
        });
    }

    loadSetting(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.stop) return resolve(false);

            const url: string = this.configService.getApiUrl(ApiTypesInfo.SettingInfo.path);
            this.httpClient.get<IApiResponse>(url).subscribe({
                next: (response) => {
                    if (this.config && this.config.app)
                        this.versionService.initBackend(this.config.app, response.build, response.versions);

                    this.configService.initApps(response.apps);
                    const setting: ISettingInfoRs = response.response as ISettingInfoRs;
                    this.settingService.init(setting);
                    resolve(true);
                },
                error: (error: IApiException) => {
                    this.stop = true;
                    resolve(false);
                },
            });
        });
    }

    checkUser(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const token: string | null = localStorage.getItem(Storages.USER_TOKEN);
            if (this.stop || !token) return resolve(false);

            const url: string = this.configService.getApiUrl(ApiTypesInfo.UserInfo.path);
            this.httpClient.get<IApiResponse>(url, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
                next: (response) => {
                    const info: IUserInfoRs = response.response as IUserInfoRs;
                    this.userService.signin(info.token, info.user);
                    resolve(true);
                },
                error: (error: IApiException) => {
                    if (error.status === HttpStatusCode.Unauthorized) this.userService.signout();
                    this.stop = true;
                    resolve(false);
                },
            });
        });
    }
}
