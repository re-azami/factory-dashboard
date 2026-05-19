import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelMemberCodeRs } from '@lib/apis';

@Component({
    host: { selector: 'search-code' },
    imports: [NgxFormModule],
    templateUrl: './search-code.component.html',
    styleUrl: './search-code.component.scss'
})
export class SearchCodeComponent {
    public ngxForm: INgxForm = {
        submit: 'جستجوی کد پرسنلی',
        inputs: [{ name: 'code', type: 'NUMERIC', minLength: 4, maxLength: 4, title: 'کد پرسنلی', autoFocus: true }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const code: string = values['code'];
        this.apiService.request<IPersonnelMemberCodeRs>('PersonnelMemberCode', { params: { code } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
