import { IOkDTO } from '../../../../dtos';

export interface ILaboratoryCargoMoveSaveRq {
    readonly cargo: string;
}

export interface ILaboratoryCargoMoveSaveRs extends IOkDTO {}
