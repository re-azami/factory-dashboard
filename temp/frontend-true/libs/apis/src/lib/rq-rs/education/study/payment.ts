import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyPaymentRq {
    readonly date: Date;
    readonly description: string;
}

export interface IEducationStudyPaymentRs extends IEducationStudyDTO {}
