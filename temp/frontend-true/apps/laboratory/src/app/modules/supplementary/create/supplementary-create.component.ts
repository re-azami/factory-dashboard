import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILaboratorySupplementaryCreateRq, ILaboratorySupplementaryCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'supplementary-create' },
    standalone: false,
    templateUrl: './supplementary-create.component.html',
    styleUrl: './supplementary-create.component.scss',
})
export class SupplementaryCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت بار متفرقه جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILaboratorySupplementaryCreateRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ILaboratorySupplementaryCreateRs>('LaboratorySupplementaryCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
