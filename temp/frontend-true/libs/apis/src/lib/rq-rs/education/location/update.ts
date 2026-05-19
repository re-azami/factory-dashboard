import { IEducationLocationDTO } from '../../../dtos';

export interface IEducationLocationUpdateRq {
    readonly title: string;
    readonly availability: boolean;
    readonly description: string;
}

export interface IEducationLocationUpdateRs extends IEducationLocationDTO {}
