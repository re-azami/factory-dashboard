import { IOkDTO } from '../../dtos';

export interface IUserPasswordRq {
    readonly current: string;
    readonly password: string;
}

export interface IUserPasswordRs extends IOkDTO {}
