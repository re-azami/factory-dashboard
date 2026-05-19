import { ISettingDTO } from '../../dtos';

export interface ISettingEducationRq {
    readonly date: 'FIRST' | 'LAST';
}

export interface ISettingEducationRs extends ISettingDTO {}
