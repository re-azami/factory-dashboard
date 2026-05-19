import { Component, ComponentRef, Input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { INotification } from './notification.interface';

@Component({
    host: { selector: 'notification' },
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss',
    animations: [
        trigger('notification', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0)' }),
                animate('250ms', style({ opacity: 1, transform: 'scale(1)' })),
            ]),
        ]),
    ],
    standalone: false
})
export class NotificationComponent {
    @Input({ required: true }) notification!: INotification;

    constructor(private readonly sanitizer: DomSanitizer) {}

    getContent(): SafeHtml {
        const content: string = this.notification?.notification || '';
        return this.sanitizer.bypassSecurityTrustHtml((content || '').replace(/(?:\r\n|\r|\n)/g, '<br />'));
    }

    close(): void {}
}
