import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILaboratoryDailyDownloadRq, ILaboratoryDailyDownloadRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { Storages } from '@lib/shared';

@Component({
    host: { selector: 'daily' },
    templateUrl: './daily.component.html',
    styleUrl: './daily.component.scss',
    standalone: false,
})
export class DailyComponent implements OnInit {
    public title: IPageTitle = {
        title: 'مشاهده نتایج روزانه',
        toolbar: { route: ['/daily'], calendar: { types: ['DAY'], maxDate: new Date() } },
    };

    public activeTab: number = 0;
    public tabs: { CRUSHER: number; KHATKA: number; BLAINE: number; DAVIS: number; SOLID: number; LOAD: number } = {
        CRUSHER: -1,
        KHATKA: -1,
        BLAINE: -1,
        DAVIS: -1,
        SOLID: -1,
        LOAD: -1,
    };

    public view: 'FULL' | 'GROUP' = 'FULL';

    public date!: Date;

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        const view = localStorage.getItem(Storages.LABORATORY_DAILY_VIEW);
        if (view === 'GROUP') this.view = 'GROUP';

        this.setTabs();
    }

    setTabs(): void {
        let index: number = 0;

        let crusherAccess: boolean = false;
        if (this.userService.hasAccess({ access: ['LABORATORY_CRUSHER', 'LABORATORY_ROLE_TECHNICIAN'] })) {
            this.tabs.CRUSHER = index++;
            crusherAccess = true;
        }

        let khatkaAccess: boolean = false;
        if (this.userService.hasAccess({ access: ['LABORATORY_KHATKA', 'LABORATORY_ROLE_TECHNICIAN'] })) {
            this.tabs.KHATKA = index++;
            khatkaAccess = true;
        }

        if (crusherAccess || khatkaAccess) {
            this.title = {
                ...this.title,
                actions: [
                    {
                        type: 'MENU',
                        title: 'دانلود',
                        icon: 'download',
                        menu: [
                            ...(crusherAccess ? [{ id: 'CRUSHER', title: 'نتایج سنگ شکن' }] : []),
                            ...(khatkaAccess ? [{ id: 'KHATKA', title: 'نتایج ختکا' }] : []),
                            'DIVIDER',
                            ...(crusherAccess && khatkaAccess ? [{ id: 'BOTH', title: 'هر دو مورد' }] : []),
                        ],
                        action: (id: string) => {
                            switch (id) {
                                case 'CRUSHER':
                                    if (crusherAccess) this.export('CRUSHER');
                                    break;
                                case 'KHATKA':
                                    if (khatkaAccess) this.export('KHATKA');
                                    break;
                                case 'BOTH':
                                    if (crusherAccess && khatkaAccess) this.export('BOTH');
                                    break;
                            }
                        },
                    },
                    {
                        type: 'MENU',
                        title: 'شیوه نمایش',
                        icon: 'grid_view',
                        menu: [
                            { id: 'FULL', title: 'نمایش جامع' },
                            { id: 'GROUP', title: 'نمایش گروهی' },
                        ],
                        action: (id: string) => this.setView(id as 'FULL' | 'GROUP'),
                        hideOn: () => this.activeTab !== this.tabs.CRUSHER && this.activeTab !== this.tabs.KHATKA,
                    },
                ],
            };
        }

        if (this.userService.hasAccess({ access: ['LABORATORY_BLAINE', 'LABORATORY_ROLE_TECHNICIAN'] }))
            this.tabs.BLAINE = index++;

        if (this.userService.hasAccess({ access: ['LABORATORY_DAVIS', 'LABORATORY_ROLE_TECHNICIAN'] }))
            this.tabs.DAVIS = index++;

        if (this.userService.hasAccess({ access: ['LABORATORY_SOLID', 'LABORATORY_ROLE_TECHNICIAN'] }))
            this.tabs.SOLID = index++;

        if (this.userService.hasAccess({ access: ['LABORATORY_LOAD', 'LABORATORY_ROLE_LOAD'] })) this.tabs.LOAD = index++;
    }

    setView(view: 'FULL' | 'GROUP'): void {
        this.view = view;
        localStorage.setItem(Storages.LABORATORY_DAILY_VIEW, view);
    }

    tabChanged(): void {
        this.title = { ...this.title };
    }

    setDate(values: INgxHelperCalendarValue): void {
        this.date = values.period.from;
        this.changeDetectorRef.detectChanges();
    }

    export(type: 'CRUSHER' | 'KHATKA' | 'BOTH'): void {
        const body: ILaboratoryDailyDownloadRq = { date: this.date };
        this.apiService.request<ILaboratoryDailyDownloadRs>(
            'LaboratoryDailyDownload',
            { body, params: { type } },
            (response) => {
                const url: string = this.configService.getApiUrl(response.path);
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, url);
            },
        );
    }
}
