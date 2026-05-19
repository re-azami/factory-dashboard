import { IUserDTO } from '../../dtos/user';

export interface IUserUpdateRq {
    readonly name: { first: string; last: string };
    readonly email: string;
    readonly mobile: string;
}

export interface IUserUpdateRs extends IUserDTO {}
