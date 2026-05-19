import { ISettingDTO } from '../../dtos';

export interface ISettingLaboratoryRq {
    readonly jump: {
        readonly active: boolean;
        readonly key: string | null;
    };
    readonly dailyDate: 'TITLE' | 'NUMBER';
    readonly crusher: string[];
    readonly khatka: string[];
}

export interface ISettingLaboratoryRs extends ISettingDTO {}
