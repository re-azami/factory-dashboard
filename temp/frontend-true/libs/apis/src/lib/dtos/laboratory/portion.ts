import { LoadCargo } from '@lib/shared';

export interface ILaboratoryCargoPortionDTO {
    readonly id: string;
    readonly title: string;
    readonly type: LoadCargo;
    readonly party: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly shipment: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly proportion: number;
}
