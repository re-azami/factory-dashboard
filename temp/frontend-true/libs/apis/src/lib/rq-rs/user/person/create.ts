import { IUserPersonDTO } from '../../../dtos';

export interface IUserPersonCreateRq {
    readonly username: string;
    readonly password: string;
    readonly name: { first: string; last: string };
    readonly email: string;
    readonly mobile: string;
}

export interface IUserPersonCreateRs extends IUserPersonDTO {}
