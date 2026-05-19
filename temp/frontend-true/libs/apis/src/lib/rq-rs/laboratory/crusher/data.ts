import { IOptionDTO } from '../../../dtos';

export interface ILaboratoryCrusherDataRs {
    readonly party: IOptionDTO[];
    readonly shipment: IOptionDTO[];
}
