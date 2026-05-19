import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryKhatkaDTO,
    ILaboratoryKhatkaUpdateRq,
    ILaboratoryKhatkaUpdateRs,
    IOptionDTO,
} from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

@Component({
    host: { selector: 'khatka-update' },
    templateUrl: './khatka-update.component.html',
    styleUrl: './khatka-update.component.scss',
    standalone: false,
})
export class KhatkaUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش نتیجه',
        inputs: [
            {
                name: 'line',
                type: 'SELECT',
                title: 'خط',
                value: this.data.khatka.line,
                options: LaboratoryLineList.map((line: LaboratoryLine) => ({
                    id: line,
                    title: LaboratoryLineInfo[line].title,
                })),
            },
            {
                name: 'begin',
                type: 'DATE',
                title: 'ساعت شروع',
                value: this.data.khatka.time.begin,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'end',
                type: 'DATE',
                title: 'ساعت پایان',
                value: this.data.khatka.time.end,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                optional: true,
                description: 'توضیحات در گزارش تغییرات آزمایش نمایش داده می‌شود.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargos: IOptionDTO[]; khatka: ILaboratoryKhatkaDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.khatka.id;
        const body: ILaboratoryKhatkaUpdateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: this.data.khatka.cargo?.id || null,
            tonnage: { feed: this.data.khatka.tonnage.feed, product: this.data.khatka.tonnage.product },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryKhatkaUpdateRs>('LaboratoryKhatkaUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
