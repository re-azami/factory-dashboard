import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryBlaineCreateRq, ILaboratoryBlaineCreateRs, IOptionDTO } from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'blaine-create' },
    templateUrl: './blaine-create.component.html',
    styleUrl: './blaine-create.component.scss',
    standalone: false
})
export class BlaineCreateComponent {
    private time = this.laboratoryTestService.getShiftTimes(this.data.shift);

    public ngxForm: INgxForm = {
        submit: 'ثبت نتیجه',
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
            { name: 'result', type: 'NUMBER', title: 'نتیجه آزمایش', decimal: 4 },
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
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { shift: 'DAY' | 'NIGHT'; cargos: IOptionDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILaboratoryBlaineCreateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: values['cargo'],
            result: values['result'],
            description: values['description'],
        };
        this.apiService.request<ILaboratoryBlaineCreateRs>('LaboratoryBlaineCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
