import { App } from '@lib/shared';

import { ISupportNotificationDTO } from '../../../dtos';

export interface ISupportNotificationCreateRq {
    readonly apps: App[];
    readonly color: string;
    readonly icon: string;
    readonly title: string;
    readonly notification: string;
    readonly expire: Date;
}

export interface ISupportNotificationCreateRs extends ISupportNotificationDTO {}
