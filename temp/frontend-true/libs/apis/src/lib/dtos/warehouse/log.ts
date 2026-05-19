import { WarehouseLog } from '@lib/shared';

export interface IWarehouseLogDTO {
    readonly log: WarehouseLog;
    readonly date: Date;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
}
