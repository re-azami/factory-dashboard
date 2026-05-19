import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftCodeRs } from '@lib/apis';

@Component({
    host: { selector: 'draft-code' },
    imports: [NgxFormModule],
    templateUrl: './draft-code.component.html',
    styleUrl: './draft-code.component.scss'
})
export class DraftCodeComponent {
    public ngxForm: INgxForm = {
        submit: 'جستجو',
        inputs: [{ name: 'code', type: 'TEXT', title: 'شماره حواله', english: true, maxLength: 11, autoFocus: true }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const code: string = values['code'];
        this.apiService.request<ILoadDraftCodeRs>('LoadDraftCode', { params: { code } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
