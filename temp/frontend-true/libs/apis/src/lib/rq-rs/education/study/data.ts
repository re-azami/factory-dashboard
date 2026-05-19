import { IOptionDTO, ISharedPersonnelMemberDTO } from '../../../dtos';

export interface IEducationStudyDataRs {
    readonly departments: IOptionDTO[];
    readonly personnels: ISharedPersonnelMemberDTO[];
    readonly courses: IOptionDTO[];
    readonly mentors: IOptionDTO[];
    readonly institutes: IOptionDTO[];
    readonly locations: IOptionDTO[];
}
