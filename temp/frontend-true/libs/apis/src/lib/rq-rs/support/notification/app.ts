import { App } from '@lib/shared';

import { ISupportNotificationDTO } from '../../../dtos';

export interface ISupportNotificationAppRq {
    readonly apps: App[];
    readonly reset: boolean;
}

export interface ISupportNotificationAppRs extends ISupportNotificationDTO {}
