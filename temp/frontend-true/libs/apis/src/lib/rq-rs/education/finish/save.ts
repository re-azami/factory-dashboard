import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationFinishSaveRq {
    readonly description: string;
}

export interface IEducationFinishSaveRs extends IEducationStudyDTO {}
