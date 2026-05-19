import { IApiInfo } from '../api.interface';

export type ApiSettingTypes =
    | 'SettingInfo'
    | 'SettingEducation'
    | 'SettingLaboratory'
    | 'SettingLoad'
    | 'SettingSupport'
    | 'SettingWarehouse';

export const ApiSettingTypesInfo: { [key in ApiSettingTypes]: IApiInfo } = {
    SettingInfo: { method: 'GET', path: '/setting' },
    SettingEducation: { method: 'POST', path: '/setting/education' },
    SettingLaboratory: { method: 'POST', path: '/setting/laboratory' },
    SettingLoad: { method: 'POST', path: '/setting/load' },
    SettingSupport: { method: 'POST', path: '/setting/support' },
    SettingWarehouse: { method: 'POST', path: '/setting/warehouse' },
};
