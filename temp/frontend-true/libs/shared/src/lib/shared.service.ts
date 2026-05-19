import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ISharedLoadCargoDTO } from '@lib/apis';
import { SharedLoadCargoComponent } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class SharedService {
    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    getLoadCargo(): Promise<ISharedLoadCargoDTO> {
        return new Promise<ISharedLoadCargoDTO>((resolve) => {
            this.ngxHelperBottomSheetService.open<ISharedLoadCargoDTO>(
                SharedLoadCargoComponent,
                'انتخاب بار',
                { padding: '0' },
                (response) => resolve(response),
            );
        });
    }
}
