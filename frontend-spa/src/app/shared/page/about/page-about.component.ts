import { Component } from '@angular/core';

import { AppVersions } from '../../../app.version';

@Component({
    host: { selector: 'app-page-about' },
    templateUrl: './page-about.component.html',
    styleUrl: './page-about.component.scss',
    standalone: false,
})
export class PageAboutComponent {
    public title: string = 'داشبورد کارخانه';
    public icon: string = 'factory';

    public apiVersion: string = AppVersions.api;
    public appVersion: string = AppVersions.app;
}
