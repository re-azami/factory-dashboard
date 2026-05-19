import { ISupportNotificationDTO } from '../../../dtos';

export interface ISupportNotificationUpdateRq {
    readonly color: string;
    readonly icon: string;
    readonly title: string;
    readonly notification: string;
    readonly expire: Date;
    readonly reset: boolean;
}

export interface ISupportNotificationUpdateRs extends ISupportNotificationDTO {}
