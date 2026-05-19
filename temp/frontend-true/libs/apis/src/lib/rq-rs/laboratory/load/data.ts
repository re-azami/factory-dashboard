import { IOptionDTO } from '../../../dtos';

export interface ILaboratoryLoadDataRs {
    readonly party: IOptionDTO[];
    readonly shipment: IOptionDTO[];
}
