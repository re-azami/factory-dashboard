import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { IUserAlertDTO } from '@lib/apis';
import { AlertInfo, App, AppInfo, AppList } from '@lib/shared';

@Component({
    selector: 'page-alert',
    templateUrl: './page-alert.component.html',
    styleUrl: './page-alert.component.scss',
    animations: [
        trigger('alerts', [
            state('show', style({ opacity: 1, height: '*' })),
            state('hide', style({ opacity: 0.5, height: 0 })),
            transition('show <=> hide', animate('150ms ease-in')),
        ]),
    ],
    standalone: false
})
export class PageAlertComponent implements OnChanges {
    @Input({ required: true }) alerts!: IUserAlertDTO[];
    @Input({ required: true }) showAlerts: boolean = false;
    @Output() showAlertsChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    public alertInfo = AlertInfo;
    public appList = AppList;
    public appInfo = AppInfo;

    public newAlerts: IUserAlertDTO[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        this.newAlerts = this.alerts.filter((a) => !a.date.view);
    }

    hasApp(app: App): boolean {
        const alerts: IUserAlertDTO[] = this.getAlerts();
        return alerts.some((a) => AlertInfo[a.type].app === app);
    }

    getAlerts(): IUserAlertDTO[] {
        return this.newAlerts.length > 0 ? this.newAlerts : this.alerts;
    }

    toggleShowAlert(): void {
        if (this.newAlerts.length > 0) {
            this.newAlerts = [];
            this.showAlerts = true;
        }

        this.showAlerts = !this.showAlerts;
        this.showAlertsChange.emit(this.showAlerts);
    }
}
