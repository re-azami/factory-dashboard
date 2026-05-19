import { ILaboratoryCargoDTO } from '../../../../dtos';

export interface ILaboratoryCargoMixedCreateRq {
    readonly portions: {
        readonly id: string;
        readonly proportion: number;
    }[];
    readonly description: string;
}

export interface ILaboratoryCargoMixedCreateRs extends ILaboratoryCargoDTO {}
