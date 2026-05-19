import { IEducationExpenseDTO, IEducationStudyDTO } from '../../../dtos';

export interface IEducationExpenseListRs {
    readonly study: IEducationStudyDTO;
    readonly list: IEducationExpenseDTO[];
}
