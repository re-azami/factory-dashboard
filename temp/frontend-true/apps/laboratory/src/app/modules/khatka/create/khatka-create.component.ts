import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryKhatkaCreateRq, ILaboratoryKhatkaCreateRs, IOptionDTO } from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'khatka-create' },
    templateUrl: './khatka-create.component.html',
    styleUrl: './khatka-create.component.scss',
    standalone: false,
})
export class KhatkaCreateComponent {
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
        private readonly router: Router,
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
            cargo: null,
            tonnage: { feed: null, product: null },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryKhatkaCreateRs>('LaboratoryKhatkaCreate', { body }, (response) => {
            this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
            this.router.navigate(['/khatka', 'info', response.id]);
        });
    }
}
