import { Injectable } from '@angular/core';

import {
    ISettingDTO,
    ISettingEducationDTO,
    ISettingLaboratoryDTO,
    ISettingLoadDTO,
    ISettingSupportDTO,
    ISettingWarehouseDTO,
} from '@lib/apis';

@Injectable({ providedIn: 'root' })
export class SettingService {
    private _retrieval!: boolean;
    get retrieval(): boolean {
        return this._retrieval;
    }

    private _alertTimeout!: number;
    get alertTimeout(): number {
        return this._alertTimeout;
    }

    private _education!: ISettingEducationDTO;
    get education(): ISettingEducationDTO {
        return this._education;
    }

    private _laboratory!: ISettingLaboratoryDTO;
    get laboratory(): ISettingLaboratoryDTO {
        return this._laboratory;
    }

    private _load!: ISettingLoadDTO;
    get load(): ISettingLoadDTO {
        return this._load;
    }

    private _support!: ISettingSupportDTO;
    get support(): ISettingSupportDTO {
        return this._support;
    }

    private _warehouse!: ISettingWarehouseDTO;
    get warehouse(): ISettingWarehouseDTO {
        return this._warehouse;
    }

    init(setting: ISettingDTO): void {
        this._retrieval = setting.retrieval;
        this._alertTimeout = setting.alertTimeout;

        this._education = setting.education;
        this._laboratory = setting.laboratory;
        this._load = setting.load;
        this._support = setting.support;
        this._warehouse = setting.warehouse;
    }
}
