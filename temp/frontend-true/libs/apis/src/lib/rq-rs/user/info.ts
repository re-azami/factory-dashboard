import { IUserDTO } from '../../dtos';

export interface IUserInfoRs {
    readonly token: string;
    readonly user: IUserDTO;
}
