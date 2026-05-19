import { ILaboratoryCargoDTO } from '../../../../dtos';

export interface ILaboratoryCargoMixedUpdateRq {
    readonly portions: {
        readonly id: string;
        readonly proportion: number;
    }[];
    readonly description: string;
}

export interface ILaboratoryCargoMixedUpdateRs extends ILaboratoryCargoDTO {}
