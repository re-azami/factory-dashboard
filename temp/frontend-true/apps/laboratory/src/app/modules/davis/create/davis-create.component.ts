import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryDavisCreateRq,
    ILaboratoryDavisCreateRs,
    ILaboratoryStandardDTO,
    ILaboratoryTestDavisRecoveryDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    IOptionDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'davis-create' },
    templateUrl: './davis-create.component.html',
    styleUrl: './davis-create.component.scss',
    standalone: false
})
export class DavisCreateComponent {
    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];

    private shift: 'DAY' | 'NIGHT' = this.activatedRoute.snapshot.params['SHIFT'];
    private time = this.laboratoryTestService.getShiftTimes(this.shift);

    public standard?: ILaboratoryStandardDTO;
    public title: IPageTitle = {
        title: 'ثبت نتیجه آزمایش دیویس تیوب',
        description: 'ختکا :: خوراک (FEED)',
        actions: [{ type: 'RETURN', action: ['/davis'] }],
    };

    public recovery?: ILaboratoryTestDavisRecoveryDTO;
    public productFe?: ILaboratoryTestFeDTO;
    public productFeo?: ILaboratoryTestFeODTO;
    public tailFe?: ILaboratoryTestFeDTO;
    public tailFeo?: ILaboratoryTestFeODTO;

    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت نتیجه',
        sections: [
            {
                columns: [
                    {
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
                            { name: 'cargo', type: 'SELECT', title: 'بار', options: this.cargos, optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: 'ریکاوری',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setRecovery.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: 'FE محصول',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: () => this.setFe('PRODUCT') },
                            },
                            {
                                type: 'COMMENT',
                                title: 'FEO محصول',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: () => this.setFeO('PRODUCT') },
                            },
                            {
                                type: 'COMMENT',
                                title: 'FE باطله',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: () => this.setFe('TAIL') },
                            },
                            {
                                type: 'COMMENT',
                                title: 'FEO باطله',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: () => this.setFeO('TAIL') },
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        optional: true,
                        description: 'توضیحات در گزارش تغییرات آزمایش نمایش داده می‌شود.',
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/davis']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    setValue(index: number, value: string): void {
        const column = this.ngxForm.sections[0].columns[1];
        if (!('inputs' in column)) return;

        const input = column.inputs[index];
        if (!('type' in input) || input.type !== 'COMMENT') return;

        input.value = value;
    }

    setRecovery(): void {
        this.laboratoryTestService.getDavisRecovery(this.recovery).then((recovery?: ILaboratoryTestDavisRecoveryDTO) => {
            this.recovery = recovery;
            this.setValue(0, this.recovery?.result.toString() || '');
        });
    }

    setFe(type: 'PRODUCT' | 'TAIL'): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService
            .getFe(this.standard.standard, type === 'PRODUCT' ? this.productFe : this.tailFe)
            .then((fe?: ILaboratoryTestFeDTO) => {
                type === 'PRODUCT' ? (this.productFe = fe) : (this.tailFe = fe);
                this.setValue(
                    type === 'PRODUCT' ? 1 : 3,
                    (type === 'PRODUCT' ? this.productFe : this.tailFe)?.result.toString() || '',
                );
            });
    }

    setFeO(type: 'PRODUCT' | 'TAIL'): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService
            .getFeO(this.standard.standard, type === 'PRODUCT' ? this.productFeo : this.tailFeo)
            .then((feo?: ILaboratoryTestFeODTO) => {
                type === 'PRODUCT' ? (this.productFeo = feo) : (this.tailFeo = feo);
                this.setValue(
                    type === 'PRODUCT' ? 2 : 4,
                    (type === 'PRODUCT' ? this.productFeo : this.tailFeo)?.result.toString() || '',
                );
            });
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.recovery && !this.productFe && !this.productFeo && !this.tailFe && !this.tailFeo) {
            this.ngxHelperToastService.error('هیچکدام از نتایح آزمایش مشخص نشده است.');
            return;
        }

        const body: ILaboratoryDavisCreateRq = {
            line: values['line'],
            begin: values['begin'],
            end: values['end'],
            cargo: values['cargo'],
            recovery: this.recovery ? JSON.stringify(this.recovery) : null,
            productFe: this.productFe ? JSON.stringify(this.productFe) : null,
            productFeo: this.productFeo ? JSON.stringify(this.productFeo) : null,
            tailFe: this.tailFe ? JSON.stringify(this.tailFe) : null,
            tailFeo: this.tailFeo ? JSON.stringify(this.tailFeo) : null,
            description: values['description'],
        };
        this.apiService.request<ILaboratoryDavisCreateRs>('LaboratoryDavisCreate', { body }, () => {
            this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
            this.router.navigate(['/davis']);
        });
    }
}
