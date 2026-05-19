import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IPersonnelMemberDTO, ISharedPersonnelMemberDTO } from '@lib/apis';

import { SearchCodeComponent, SearchPersonnelComponent } from '../components';

@Injectable({ providedIn: 'root' })
export class PersonnelSearchService {
    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    code(): void {
        this.ngxHelperBottomSheetService.open<IPersonnelMemberDTO>(SearchCodeComponent, 'جستجوی کد پرسنلی', (response) =>
            this.router.navigate(['/member', 'info', response.id]),
        );
    }

    personnel(): void {
        this.ngxHelperBottomSheetService.open<ISharedPersonnelMemberDTO>(
            SearchPersonnelComponent,
            'جستجوی پرسنل',
            (response) => this.router.navigate(['/member', 'info', response.id]),
        );
    }
}
