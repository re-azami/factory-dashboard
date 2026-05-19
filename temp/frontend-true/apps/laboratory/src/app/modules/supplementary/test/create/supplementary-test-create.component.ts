import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryStandardDTO,
    ILaboratorySupplementaryDTO,
    ILaboratorySupplementaryTestCreateRq,
    ILaboratorySupplementaryTestCreateRs,
    ILaboratoryTestDavisRecoveryDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../../providers';

@Component({
    host: { selector: 'supplementary-test-create' },
    standalone: false,
    templateUrl: './supplementary-test-create.component.html',
    styleUrl: './supplementary-test-create.component.scss',
})
export class SupplementaryTestCreateComponent {
    public supplementary: ILaboratorySupplementaryDTO = this.activatedRoute.snapshot.data['supplementary'];

    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای متفرقه',
        description: this.supplementary.title,
        actions: [{ type: 'RETURN', action: ['/supplementary', this.supplementary.id] }],
    };

    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت نتیجه آزمایش',
        sections: [
            { columns: [{ name: 'date', type: 'DATE', value: new Date(), maxDate: new Date() }] },
            {
                title: 'خوراک',
                columns: [
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FE'].title,
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title,
                                value: '',
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
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setGrind.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['MOISTURE'].title,
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setMoisture.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['SULPHUR'].title,
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setSulphur.bind(this) },
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    { inputs: [{ name: 'gauss', type: 'NUMBER', title: 'گاوس', optional: true }] },
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: 'ریکاوری',
                                value: '',
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
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setProductFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title + ' محصول',
                                value: '',
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
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setTailFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title + ' باطله',
                                value: '',
                                english: true,
                                button: { icon: 'calculate', click: this.setTailFeO.bind(this) },
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/supplementary', this.supplementary.id]) }],
    };

    public fe?: ILaboratoryTestFeDTO;
    public feo?: ILaboratoryTestFeODTO;
    public grind?: ILaboratoryTestGrindDTO;
    public moisture?: ILaboratoryTestMoistureDTO;
    public sulphur?: ILaboratoryTestSulphurDTO;

    public recovery?: ILaboratoryTestDavisRecoveryDTO;

    public productFe?: ILaboratoryTestFeDTO;
    public productFeo?: ILaboratoryTestFeODTO;

    public tailFe?: ILaboratoryTestFeDTO;
    public tailFeo?: ILaboratoryTestFeODTO;

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
            this.setValue(1, 0, 0, this.fe?.result.toString() || '');
        });
    }

    setFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.feo).then((feo?: ILaboratoryTestFeODTO) => {
            this.feo = feo;
            this.setValue(1, 0, 1, this.feo?.result.toString() || '');
        });
    }

    setGrind(): void {
        this.laboratoryTestService.getGrind('NONE', this.grind).then((grind?: ILaboratoryTestGrindDTO) => {
            this.grind = grind;
            this.setValue(1, 1, 0, this.grind?.result.toString() || '');
        });
    }

    setMoisture(): void {
        this.laboratoryTestService.getMoisture(this.moisture).then((moisture?: ILaboratoryTestMoistureDTO) => {
            this.moisture = moisture;
            this.setValue(1, 1, 1, this.moisture?.result.toString() || '');
        });
    }

    setSulphur(): void {
        this.laboratoryTestService.getSulphur(this.sulphur).then((sulphur?: ILaboratoryTestSulphurDTO) => {
            this.sulphur = sulphur;
            this.setValue(1, 1, 2, this.sulphur?.result.toString() || '');
        });
    }

    setRecovery(): void {
        this.laboratoryTestService.getDavisRecovery(this.recovery).then((recovery?: ILaboratoryTestDavisRecoveryDTO) => {
            this.recovery = recovery;
            this.setValue(2, 1, 0, this.recovery?.result.toString() || '');
        });
    }

    setProductFe(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFe(this.standard.standard, this.productFe).then((fe?: ILaboratoryTestFeDTO) => {
            this.productFe = fe;
            this.setValue(3, 0, 0, this.productFe?.result.toString() || '');
        });
    }

    setProductFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.productFeo).then((feo?: ILaboratoryTestFeODTO) => {
            this.productFeo = feo;
            this.setValue(3, 0, 1, this.productFeo?.result.toString() || '');
        });
    }

    setTailFe(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFe(this.standard.standard, this.tailFe).then((fe?: ILaboratoryTestFeDTO) => {
            this.tailFe = fe;
            this.setValue(3, 1, 0, this.tailFe?.result.toString() || '');
        });
    }

    setTailFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.tailFeo).then((feo?: ILaboratoryTestFeODTO) => {
            this.tailFeo = feo;
            this.setValue(3, 1, 1, this.tailFeo?.result.toString() || '');
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

        const SUPPLEMENTARYID: string = this.supplementary.id;
        const body: ILaboratorySupplementaryTestCreateRq = {
            date: values['date'],
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
        this.apiService.request<ILaboratorySupplementaryTestCreateRs>(
            'LaboratorySupplementaryTestCreate',
            { body, ids: { SUPPLEMENTARYID } },
            () => {
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                this.router.navigate(['/supplementary', this.supplementary.id]);
            },
        );
    }
}
