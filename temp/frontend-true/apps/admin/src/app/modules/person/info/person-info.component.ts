import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { IUserPersonDTO } from '@lib/apis';
import { Access, AccessInfo, App, AppInfo } from '@lib/shared';

@Component({
    host: { selector: 'person-info' },
    templateUrl: './person-info.component.html',
    styleUrls: ['./person-info.component.scss'],
    standalone: false
})
export class PersonInfoComponent implements OnInit {
    public access: { title: string; list: { type?: string; title: string }[] }[] = [];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { person: IUserPersonDTO }) {}

    ngOnInit(): void {
        this.access = [];
        if (this.data.person.group === 'MANAGER') return;

        if (this.data.person.group === 'ADMIN') {
            const apps: App[] = this.data.person.admin;
            if (apps.length !== 0)
                this.access.push({
                    title: 'مدیریت',
                    list: apps
                        .map((a: App) => ({ type: undefined, title: AppInfo[a].title }))
                        .sort((a1, a2) => a1.title.localeCompare(a2.title)),
                });
        }

        const apps: App[] = this.data.person.group === 'ADMIN' ? this.data.person.admin : [];
        const access: Access[] = this.data.person.access.filter((a: Access) => !apps.includes(AccessInfo[a].app));

        access
            .map((a: Access) => AccessInfo[a].app)
            .filter((a: App, i: number, arr: App[]) => arr.indexOf(a) === i)
            .sort((a1, a2) => AppInfo[a1].title.localeCompare(AppInfo[a2].title))
            .forEach((app: App) => {
                this.access.push({
                    title: AppInfo[app].title,
                    list: access
                        .filter((a: Access) => AccessInfo[a].app === app)
                        .map((a: Access) => ({ type: AccessInfo[a].type || '', title: AccessInfo[a].title }))
                        .sort((a1, a2) =>
                            a1.type === a2.type ? a1.title.localeCompare(a2.title) : a1.type.localeCompare(a2.type),
                        ),
                });
            });

        this.access = this.access.filter((a) => a.list.length !== 0);
    }
}
