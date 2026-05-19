import { ISettingDTO } from '../../dtos';

export interface ISettingSupportRq {
    readonly inform: string[];
}

export interface ISettingSupportRs extends ISettingDTO {}
