import { LoadCargo } from '@lib/shared';

import { ILaboratoryCargoPortionDTO } from './portion';

export interface ILaboratoryCargoDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly type: LoadCargo | null;
    readonly party: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly shipment: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly status: 'ACTIVE' | 'DEACTIVE';
    readonly isShared: boolean;
    readonly portions: ILaboratoryCargoPortionDTO[];
    readonly description: string;
}
