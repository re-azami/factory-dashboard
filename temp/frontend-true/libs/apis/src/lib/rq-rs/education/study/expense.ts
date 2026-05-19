import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyExpenseRq {
    readonly expense: number;
    readonly description: string;
}

export interface IEducationStudyExpenseRs extends IEducationStudyDTO {}
