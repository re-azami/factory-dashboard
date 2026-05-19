import { IEducationInstituteDTO, IEducationStudyDTO } from '../../../dtos';

export interface IEducationReportInstituteRs {
    readonly institute: IEducationInstituteDTO;
    readonly first: Date;
    readonly last: Date;
    readonly studies: IEducationStudyDTO[];
}
