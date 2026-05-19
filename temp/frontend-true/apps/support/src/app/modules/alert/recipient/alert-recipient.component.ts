import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { IAlertDTO } from '@lib/apis';
import { AlertInfo, AppInfo } from '@lib/shared';

@Component({
    host: { selector: 'alert-recipient' },
    templateUrl: './alert-recipient.component.html',
    styleUrl: './alert-recipient.component.scss',
    standalone: false
})
export class AlertRecipientComponent implements OnInit, OnDestroy {
    public appInfo = AppInfo;
    public alertInfo = AlertInfo;

    public alert: IAlertDTO = this.data.alert;

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { alert: IAlertDTO }) {}

    ngOnInit(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '600px');
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
    }
}
