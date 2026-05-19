import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryCrusherDTO,
    ILaboratoryCrusherUpdateRq,
    ILaboratoryCrusherUpdateRs,
    IOptionDTO,
} from '@lib/apis';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

@Component({
    host: { selector: 'crusher-update' },
    templateUrl: './crusher-update.component.html',
    styleUrl: './crusher-update.component.scss',
    standalone: false,
})
export class CrusherUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش نتیجه',
        inputs: [
            {
                name: 'line',
                type: 'SELECT',
                title: 'خط',
                value: this.data.crusher.line,
                options: LaboratoryLineList.map((line: LaboratoryLine) => ({
                    id: line,
                    title: LaboratoryLineInfo[line].title,
                })),
            },
            {
                name: 'begin',
                type: 'DATE',
                title: 'ساعت شروع',
                value: this.data.crusher.time.begin,
                maxDate: new Date(),
                hour: true,
            },
            {
                name: 'end',
                type: 'DATE',
                title: 'ساعت پایان',
                value: this.data.crusher.time.end,
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
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargos: IOptionDTO[]; crusher: ILaboratoryCrusherDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.crusher.id;
        const body: ILaboratoryCrusherUpdateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: this.data.crusher.cargo?.id || null,
            tonnage: {
                feed: this.data.crusher.tonnage.feed,
                product: this.data.crusher.tonnage.product,
                gauss1200: this.data.crusher.tonnage.gauss1200,
                gauss2000: this.data.crusher.tonnage.gauss2000,
                tail: this.data.crusher.tonnage.tail,
            },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryCrusherUpdateRs>('LaboratoryCrusherUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
