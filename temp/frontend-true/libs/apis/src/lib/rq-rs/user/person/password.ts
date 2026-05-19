import { IOkDTO } from '../../../dtos';

export interface IUserPersonPasswordRq {
    readonly password: string;
}

export interface IUserPersonPasswordRs extends IOkDTO {}
