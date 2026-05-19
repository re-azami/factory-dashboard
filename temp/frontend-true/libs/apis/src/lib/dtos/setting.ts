import { ISettingEducationDTO } from './setting/education';
import { ISettingLaboratoryDTO } from './setting/laboratory';
import { ISettingLoadDTO } from './setting/load';
import { ISettingSupportDTO } from './setting/support';
import { ISettingWarehouseDTO } from './setting/warehouse';

export interface ISettingDTO {
    readonly retrieval: boolean;
    readonly alertTimeout: number;

    readonly education: ISettingEducationDTO;
    readonly laboratory: ISettingLaboratoryDTO;
    readonly load: ISettingLoadDTO;
    readonly support: ISettingSupportDTO;
    readonly warehouse: ISettingWarehouseDTO;
}
