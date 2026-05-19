import { IOkDTO } from '../../../dtos';

export interface IUserRetrievalConfirmRq {
    readonly id: string;
    readonly code: string;
    readonly username: string;
    readonly mobile: string;
    readonly password: string;
}

export interface IUserRetrievalConfirmRs extends IOkDTO {}
