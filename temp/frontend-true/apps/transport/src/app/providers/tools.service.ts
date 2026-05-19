import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IOptionDTO } from '@lib/apis';

import { SelectGroupComponent } from '../components';

@Injectable({ providedIn: 'root' })
export class TransportToolsService {
    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    selectGroup(callback: (group: IOptionDTO) => void): void {
        this.ngxHelperBottomSheetService.open<IOptionDTO>(SelectGroupComponent, 'انتخاب گروه', (response) =>
            callback(response),
        );
    }
}
