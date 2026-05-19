import { Component, OnInit } from '@angular/core';

import { ConfigService, IVersion, VersionService } from '@lib/providers';
import { App, AppInfo } from '@lib/shared';

@Component({
    host: { selector: 'lib-page-about' },
    templateUrl: './page-about.component.html',
    styleUrl: './page-about.component.scss',
    standalone: false
})
export class PageAboutComponent implements OnInit {
    public applicationEnglish: string = this.configService.applicationEnglish;

    public app?: 'ADMIN' | App = this.versionService.app;
    public frontend?: IVersion = this.versionService.frontend;
    public backend?: IVersion = this.versionService.backend;

    public title?: string;
    public icon?: string;

    constructor(private readonly configService: ConfigService, private readonly versionService: VersionService) {}

    ngOnInit(): void {
        if (this.app === 'ADMIN') {
            this.title = 'مدیریت';
            this.icon = 'manage_accounts';
        } else if (!!this.app) {
            this.title = AppInfo[this.app].title;
            this.icon = AppInfo[this.app].icon;
        }
    }
}
