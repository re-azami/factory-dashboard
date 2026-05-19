import { IOptionDTO } from '../../../dtos';

export interface ILaboratoryKhatkaDataRs {
    readonly party: IOptionDTO[];
    readonly shipment: IOptionDTO[];
}
