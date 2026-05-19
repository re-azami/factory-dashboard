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
    host: { selector: 'production-crusher-update' },
    standalone: false,
    templateUrl: './production-crusher-update.component.html',
    styleUrl: './production-crusher-update.component.scss',
})
export class ProductionCrusherUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش تولید',
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
                name: 'cargo',
                type: 'SELECT',
                title: 'بار',
                value: this.data.crusher.cargo?.id,
                options: this.data.cargos,
                optional: true,
            },
            [
                {
                    name: 'feed',
                    type: 'NUMBER',
                    title: 'تناژ خوراک',
                    value: this.data.crusher.tonnage.feed,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
                {
                    name: 'product',
                    type: 'NUMBER',
                    title: 'تناژ تولید',
                    value: this.data.crusher.tonnage.product,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
            ],
            [
                {
                    name: 'gauss1200',
                    type: 'NUMBER',
                    title: 'تناژ گاوس ۱۲۰۰',
                    value: this.data.crusher.tonnage.gauss1200,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
                {
                    name: 'gauss2000',
                    type: 'NUMBER',
                    title: 'تناژ گاوس ۲۰۰۰',
                    value: this.data.crusher.tonnage.gauss2000,
                    optional: true,
                    minimum: 1,
                    suffix: 'تن',
                },
                {
                    name: 'tail',
                    type: 'NUMBER',
                    title: 'تناژ باطله',
                    value: this.data.crusher.tonnage.tail,
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
            cargo: values['cargo'],
            tonnage: {
                feed: values['feed'],
                product: values['product'],
                gauss1200: values['gauss1200'],
                gauss2000: values['gauss2000'],
                tail: values['tail'],
            },
            description: values['description'],
        };
        this.apiService.request<ILaboratoryCrusherUpdateRs>('LaboratoryCrusherUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
