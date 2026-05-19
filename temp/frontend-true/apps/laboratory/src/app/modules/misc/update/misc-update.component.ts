import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryMiscDTO,
    ILaboratoryMiscUpdateRq,
    ILaboratoryMiscUpdateRs,
    ILaboratoryStandardDTO,
    ILaboratoryTestDavisRecoveryDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'misc-update' },
    standalone: false,
    templateUrl: './misc-update.component.html',
    styleUrl: './misc-update.component.scss',
})
export class MiscUpdateComponent {
    public misc: ILaboratoryMiscDTO = this.activatedRoute.snapshot.data['misc'];

    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای متفرقه',
        actions: [{ type: 'RETURN', action: ['/misc'] }],
    };

    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش نتیجه آزمایش',
        sections: [
            {
                columns: [
                    { inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', value: this.misc.title }] },
                    { inputs: [{ name: 'date', type: 'DATE', value: this.misc.date, maxDate: new Date() }] },
                ],
            },
            { columns: [{ name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true }] },
            {
                title: 'خوراک',
                columns: [
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FE'].title,
                                value: this.misc.fe?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title,
                                value: this.misc.feo?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setFeO.bind(this) },
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['GRIND'].title,
                                value: this.misc.grind?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setGrind.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['MOISTURE'].title,
                                value: this.misc.moisture?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setMoisture.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['SULPHUR'].title,
                                value: this.misc.sulphur?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setSulphur.bind(this) },
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    { inputs: [{ name: 'gauss', type: 'NUMBER', title: 'گاوس', value: this.misc.gauss, optional: true }] },
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: 'ریکاوری',
                                value: this.misc.recovery?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setRecovery.bind(this) },
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        title: 'محصول',
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FE'].title + ' محصول',
                                value: this.misc.product?.fe?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setProductFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title + ' محصول',
                                value: this.misc.product?.feo?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setProductFeO.bind(this) },
                            },
                        ],
                    },
                    {
                        title: 'باطله',
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FE'].title + ' باطله',
                                value: this.misc.tail?.fe?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setTailFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title + ' باطله',
                                value: this.misc.tail?.feo?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setTailFeO.bind(this) },
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/misc']) }],
    };

    public fe?: ILaboratoryTestFeDTO = this.misc.fe || undefined;
    public feo?: ILaboratoryTestFeODTO = this.misc.feo || undefined;
    public grind?: ILaboratoryTestGrindDTO = this.misc.grind || undefined;
    public moisture?: ILaboratoryTestMoistureDTO = this.misc.moisture || undefined;
    public sulphur?: ILaboratoryTestSulphurDTO = this.misc.sulphur || undefined;

    public recovery?: ILaboratoryTestDavisRecoveryDTO = this.misc.recovery || undefined;

    public productFe?: ILaboratoryTestFeDTO = this.misc.product.fe || undefined;
    public productFeo?: ILaboratoryTestFeODTO = this.misc.product.feo || undefined;

    public tailFe?: ILaboratoryTestFeDTO = this.misc.tail.fe || undefined;
    public tailFeo?: ILaboratoryTestFeODTO = this.misc.tail.feo || undefined;

    public standard?: ILaboratoryStandardDTO;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    setValue(section: number, col: number, row: number, value: string): void {
        const column = this.ngxForm.sections[section].columns[col];
        if (!('inputs' in column)) return;

        const input = column.inputs[row];
        if (!('type' in input) || input.type !== 'COMMENT') return;

        input.value = value;
    }

    setFe(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFe(this.standard.standard, this.fe).then((fe?: ILaboratoryTestFeDTO) => {
            this.fe = fe;
            this.setValue(2, 0, 0, this.fe?.result.toString() || '');
        });
    }

    setFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.feo).then((feo?: ILaboratoryTestFeODTO) => {
            this.feo = feo;
            this.setValue(2, 0, 1, this.feo?.result.toString() || '');
        });
    }

    setGrind(): void {
        this.laboratoryTestService.getGrind('NONE', this.grind).then((grind?: ILaboratoryTestGrindDTO) => {
            this.grind = grind;
            this.setValue(2, 1, 0, this.grind?.result.toString() || '');
        });
    }

    setMoisture(): void {
        this.laboratoryTestService.getMoisture(this.moisture).then((moisture?: ILaboratoryTestMoistureDTO) => {
            this.moisture = moisture;
            this.setValue(2, 1, 1, this.moisture?.result.toString() || '');
        });
    }

    setSulphur(): void {
        this.laboratoryTestService.getSulphur(this.sulphur).then((sulphur?: ILaboratoryTestSulphurDTO) => {
            this.sulphur = sulphur;
            this.setValue(2, 1, 2, this.sulphur?.result.toString() || '');
        });
    }

    setRecovery(): void {
        this.laboratoryTestService.getDavisRecovery(this.recovery).then((recovery?: ILaboratoryTestDavisRecoveryDTO) => {
            this.recovery = recovery;
            this.setValue(3, 1, 0, this.recovery?.result.toString() || '');
        });
    }

    setProductFe(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFe(this.standard.standard, this.productFe).then((fe?: ILaboratoryTestFeDTO) => {
            this.productFe = fe;
            this.setValue(4, 0, 0, this.productFe?.result.toString() || '');
        });
    }

    setProductFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.productFeo).then((feo?: ILaboratoryTestFeODTO) => {
            this.productFeo = feo;
            this.setValue(4, 0, 1, this.productFeo?.result.toString() || '');
        });
    }

    setTailFe(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFe(this.standard.standard, this.tailFe).then((fe?: ILaboratoryTestFeDTO) => {
            this.tailFe = fe;
            this.setValue(4, 1, 0, this.tailFe?.result.toString() || '');
        });
    }

    setTailFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.tailFeo).then((feo?: ILaboratoryTestFeODTO) => {
            this.tailFeo = feo;
            this.setValue(4, 1, 1, this.tailFeo?.result.toString() || '');
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const gauss: number | null = values['gauss'];
        if (
            !this.fe &&
            !this.feo &&
            !this.grind &&
            !this.moisture &&
            !this.sulphur &&
            !gauss &&
            !this.recovery &&
            !this.productFe &&
            !this.productFeo &&
            !this.tailFe &&
            !this.tailFeo
        ) {
            this.ngxHelperToastService.error('هیچکدام از نتایح آزمایش مشخص نشده است.');
            return;
        }

        const ID: string = this.misc.id;
        const body: ILaboratoryMiscUpdateRq = {
            date: values['date'],
            title: values['title'],
            description: values['description'],
            fe: this.fe ? JSON.stringify(this.fe) : null,
            feo: this.feo ? JSON.stringify(this.feo) : null,
            grind: this.grind ? JSON.stringify(this.grind) : null,
            moisture: this.moisture ? JSON.stringify(this.moisture) : null,
            sulphur: this.sulphur ? JSON.stringify(this.sulphur) : null,
            gauss,
            recovery: this.recovery ? JSON.stringify(this.recovery) : null,
            productFe: this.productFe ? JSON.stringify(this.productFe) : null,
            productFeo: this.productFeo ? JSON.stringify(this.productFeo) : null,
            tailFe: this.tailFe ? JSON.stringify(this.tailFe) : null,
            tailFeo: this.tailFeo ? JSON.stringify(this.tailFeo) : null,
        };
        this.apiService.request<ILaboratoryMiscUpdateRs>('LaboratoryMiscUpdate', { body, ids: { ID } }, () => {
            this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
            this.router.navigate(['/misc']);
        });
    }
}
