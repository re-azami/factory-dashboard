import { IUserDTO } from '../../dtos';

export interface IUserSigninRq {
    readonly username: string;
    readonly password: string;
}

export interface IUserSigninRs {
    readonly token: string;
    readonly user: IUserDTO;
}
