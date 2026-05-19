import { IOptionDTO } from '../../../../dtos';

export interface ILaboratoryCargoMoveInfoRs {
    readonly count: {
        readonly crusher: number;
        readonly khatka: number;
        readonly blaine: number;
        readonly davis: number;
        readonly solid: number;
    };
    readonly cargos: IOptionDTO[];
}
