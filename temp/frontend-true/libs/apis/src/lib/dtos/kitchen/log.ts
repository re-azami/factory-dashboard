import { KitchenLog } from '@lib/shared';

export interface IKitchenLogDTO {
    readonly date: Date;
    readonly log: KitchenLog;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
    readonly changes: {
        readonly title: string;
        readonly initial: string;
        readonly changed: string;
    }[];
    readonly description: string;
}
