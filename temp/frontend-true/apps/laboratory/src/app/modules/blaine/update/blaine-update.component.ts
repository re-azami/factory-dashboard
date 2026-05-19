import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryBlaineDTO,
    ILaboratoryBlaineUpdateRq,
    ILaboratoryBlaineUpdateRs,
    IOptionDTO,
} from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

@Component({
    host: { selector: 'blaine-update' },
    templateUrl: './blaine-update.component.html',
    styleUrl: './blaine-update.component.scss',
    standalone: false
})
export class BlaineUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش نتیجه',
        inputs: [
            {
                name: 'line',
                type: 'SELECT',
                title: 'خط',
                value: this.data.blaine.line,
                options: LaboratoryLineList.map((line: LaboratoryLine) => ({
                    id: line,
                    title: LaboratoryLineInfo[line].title,
                })),
            },
            {
                name: 'begin',
                type: 'DATE',
                title: 'ساعت شروع',
                value: this.data.blaine.time.begin,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'end',
                type: 'DATE',
                title: 'ساعت پایان',
                value: this.data.blaine.time.end,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'cargo',
                type: 'SELECT',
                title: 'بار',
                value: this.data.blaine.cargo?.id,
                options: this.data.cargos,
                optional: true,
            },
            { name: 'result', type: 'NUMBER', value: this.data.blaine.result, title: 'نتیجه آزمایش', decimal: 4 },
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
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargos: IOptionDTO[]; blaine: ILaboratoryBlaineDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.blaine.id;
        const body: ILaboratoryBlaineUpdateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: values['cargo'],
            result: values['result'],
            description: values['description'],
        };
        this.apiService.request<ILaboratoryBlaineUpdateRs>('LaboratoryBlaineUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
