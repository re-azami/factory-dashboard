import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ISupportNotificationDTO } from '@lib/apis';

@Component({
    host: { selector: 'notification-user' },
    templateUrl: './notification-user.component.html',
    styleUrl: './notification-user.component.scss',
    standalone: false
})
export class NotificationUserComponent {
    public notification: ISupportNotificationDTO = this.data.notification;

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { notification: ISupportNotificationDTO }) {}
}
