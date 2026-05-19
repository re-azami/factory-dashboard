import { IOptionDTO } from '../../../dtos';

export interface IPersonnelGroupFullRs {
    readonly education: IOptionDTO[];
    readonly department: IOptionDTO[];
    readonly position: IOptionDTO[];
}
