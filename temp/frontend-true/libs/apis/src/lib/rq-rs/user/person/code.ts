import { IOkDTO } from '../../../dtos';

export interface IUserPersonCodeRq {
    readonly code: string;
}

export interface IUserPersonCodeRs extends IOkDTO {}
