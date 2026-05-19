import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryKhatkaCreateRq, ILaboratoryKhatkaCreateRs, IOptionDTO } from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

import { LaboratoryTestService } from '../../../../providers';

@Component({
    host: { selector: 'production-khatka-create' },
    standalone: false,
    templateUrl: './production-khatka-create.component.html',
    styleUrl: './production-khatka-create.component.scss',
})
export class ProductionKhatkaCreateComponent {
    private time = this.laboratoryTestService.getShiftTimes(this.data.shift);

    public ngxForm: INgxForm = {
        submit: 'ثبت تولید',
        inputs: [
            {
                name: 'line',
                type: 'SELECT',
                title: 'خط',
                options: LaboratoryLineList.map((line: LaboratoryLine) => ({
                    id: line,
                    title: LaboratoryLineInfo[line].title,
                })),
            },
            {
                name: 'begin',
                type: 'DATE',
                title: 'ساعت شروع',
                value: this.time.begin,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'end',
                type: 'DATE',
                title: 'ساعت پایان',
                value: this.time.end,
                maxDate: new Date(),
                hour: true,
            },
            { name: 'cargo', type: 'SELECT', title: 'بار', options: this.data.cargos, optional: true },
            [
                { name: 'feed', type: 'NUMBER', title: 'تناژ خوراک', optional: true, minimum: 1, suffix: 'تن' },
                { name: 'product', type: 'NUMBER', title: 'تناژ تولید', optional: true, minimum: 1, suffix: 'تن' },
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
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { shift: 'DAY' | 'NIGHT'; cargos: IOptionDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILaboratoryKhatkaCreateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: values['cargo'],
            tonnage: { feed: values['feed'], product: values['product'] },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryKhatkaCreateRs>('LaboratoryKhatkaCreate', { body }, (response) => {
            this.ngxHelperToastService.success('اطلاعات تولید با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
