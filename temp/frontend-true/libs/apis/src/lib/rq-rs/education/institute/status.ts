import { IOkDTO } from '../../../dtos';

export interface IEducationInstituteStatusRq {
    readonly active: boolean;
}

export interface IEducationInstituteStatusRs extends IOkDTO {}
