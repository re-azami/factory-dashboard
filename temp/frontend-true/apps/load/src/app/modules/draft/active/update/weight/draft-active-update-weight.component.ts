import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftDTO, ILoadDraftUpdateWeightRq, ILoadDraftUpdateWeightRs } from '@lib/apis';

import { LoadSettingService } from '../../../../../providers';

@Component({
    host: { selector: 'draft-active-update-weight' },
    templateUrl: './draft-active-update-weight.component.html',
    styleUrl: './draft-active-update-weight.component.scss',
    standalone: false
})
export class DraftActiveUpdateWeightComponent {
    public draft: ILoadDraftDTO = this.data.draft;

    public ngxForm: INgxForm = {
        submit: 'ویرایش اطلاعات وزنی حواله',
        inputs: [
            [
                {
                    name: 'empty',
                    type: 'NUMBER',
                    title: 'وزن خالی',
                    value: this.draft.weight.empty,
                    suffix: 'کیلو',
                    minimum: 10_000,
                    maximum: this.loadSettingService.weight.empty,
                    multiplyOf: this.loadSettingService.weight.multiply,
                    disableOn: () => !this.draft.weight.empty,
                },
                {
                    name: 'full',
                    type: 'NUMBER',
                    title: 'وزن پر',
                    value: this.draft.weight.full,
                    suffix: 'کیلو',
                    minimum: this.loadSettingService.weight.full,
                    maximum: 99_999,
                    multiplyOf: this.loadSettingService.weight.multiply,
                    disableOn: () => !this.draft.weight.full,
                },
            ],
            { type: 'COMMENT', title: 'وزن خالص', value: '', onChange: this.getWeight.bind(this), english: true },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                description: 'توضیحات در گزارش تغییرات حواله نمایش داده خواهد شد.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    getWeight(values: INgxFormValues): string | null {
        if (isNaN(values['empty']) || values['empty'] < 10_000 || values['empty'] > this.loadSettingService.weight.empty)
            return null;
        if (isNaN(values['full']) || values['full'] < this.loadSettingService.weight.full || values['full'] > 99_999)
            return null;
        if (values['full'] <= values['empty']) return null;

        return Helper.NUMBER.format(values['full'] - values['empty'], 'EN');
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateWeightRq = {
            empty: values['empty'] || null,
            full: values['full'] || null,
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateWeightRs>('LoadDraftUpdateWeight', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
