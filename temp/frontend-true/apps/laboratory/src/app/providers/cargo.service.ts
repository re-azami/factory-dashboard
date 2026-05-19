import { Injectable } from '@angular/core';
import { ILaboratoryCargoPortionDTO } from '@lib/apis';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { CargoPortionComponent } from '../components';

@Injectable({ providedIn: 'root' })
export class LaboratoryCargoService {
    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    showMixed(title: string, portions: ILaboratoryCargoPortionDTO[]): void {
        if (portions.length === 0) return;

        this.ngxHelperBottomSheetService.open(CargoPortionComponent, 'لیست بارهای بار مخلوط', {
            data: { title, portions },
            padding: '0',
        });
    }
}
