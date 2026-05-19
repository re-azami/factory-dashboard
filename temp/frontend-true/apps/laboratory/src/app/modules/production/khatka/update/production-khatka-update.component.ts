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
    host: { selector: 'production-khatka-update' },
    standalone: false,
    templateUrl: './production-khatka-update.component.html',
    styleUrl: './production-khatka-update.component.scss',
})
export class ProductionKhatkaUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش تولید',
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
                name: 'cargo',
                type: 'SELECT',
                title: 'بار',
                value: this.data.khatka.cargo?.id,
                options: this.data.cargos,
                optional: true,
            },
            [
                {
                    name: 'feed',
                    type: 'NUMBER',
                    title: 'تناژ خوراک',
                    value: this.data.khatka.tonnage.feed,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
                {
                    name: 'product',
                    type: 'NUMBER',
                    title: 'تناژ تولید',
                    value: this.data.khatka.tonnage.product,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
            ],
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                optional: true,
                description: 'توضیحات در گزارش تغییرات نمایش داده می‌شود.',
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
            cargo: values['cargo'],
            tonnage: { feed: values['feed'], product: values['product'] },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryKhatkaUpdateRs>('LaboratoryKhatkaUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
