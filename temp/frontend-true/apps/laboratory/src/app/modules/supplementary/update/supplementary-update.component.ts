import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratorySupplementaryDTO,
    ILaboratorySupplementaryUpdateRq,
    ILaboratorySupplementaryUpdateRs,
} from '@lib/apis';

@Component({
    host: { selector: 'supplementary-update' },
    standalone: false,
    templateUrl: './supplementary-update.component.html',
    styleUrl: './supplementary-update.component.scss',
})
export class SupplementaryUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش بار',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.supplementary.title, autoFocus: true },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.supplementary.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { supplementary: ILaboratorySupplementaryDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.supplementary.id;
        const body: ILaboratorySupplementaryUpdateRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ILaboratorySupplementaryUpdateRs>(
            'LaboratorySupplementaryUpdate',
            { body, ids: { ID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
