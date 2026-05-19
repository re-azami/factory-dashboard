import { IEducationLocationDTO } from '../../../dtos';

export interface IEducationLocationCreateRq {
    readonly title: string;
    readonly availability: boolean;
    readonly description: string;
}

export interface IEducationLocationCreateRs extends IEducationLocationDTO {}
