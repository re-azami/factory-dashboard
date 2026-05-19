import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryLoadClearRs,
    ILaboratoryLoadDTO,
    ILaboratoryLoadUpdateRq,
    ILaboratoryLoadUpdateRs,
    ILaboratoryStandardDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { LaboratoryResultInfo, LoadCargoInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'load-update' },
    templateUrl: './load-update.component.html',
    styleUrl: './load-update.component.scss',
    standalone: false
})
export class LoadUpdateComponent {
    public load: ILaboratoryLoadDTO = this.activatedRoute.snapshot.data['load'];

    public loadCargoInfo = LoadCargoInfo;

    public title: IPageTitle = {
        title: 'مدیریت نتایج آزمایش بارهای روزانه',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratoryLoadLog', this.load.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/load'] },
        ],
    };

    public fe?: ILaboratoryTestFeDTO = this.load.fe || undefined;
    public feo?: ILaboratoryTestFeODTO = this.load.feo || undefined;
    public grind?: ILaboratoryTestGrindDTO = this.load.grind || undefined;
    public moisture?: ILaboratoryTestMoistureDTO = this.load.moisture || undefined;
    public sulphur?: ILaboratoryTestSulphurDTO = this.load.sulphur || undefined;

    public blocks: IPageBlock[][] = [
        [
            { title: 'بار', value: this.load.cargo.title },
            { title: 'طرف حساب', value: this.load.cargo.party?.title || '' },
            { title: 'محوله', value: this.load.cargo.shipment?.title || '' },
        ],
        [
            { title: 'تاریخ', value: JalaliDateTime().toTitle(this.load.date) },
            { title: 'تعداد حواله', value: this.load.draft.count },
            { title: 'وزن حواله‌ها', value: this.load.draft.weight },
        ],
    ];

    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت نتیجه آزمایش',
        sections: [
            {
                columns: [
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FE'].title,
                                value: this.load.fe?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setFe.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['FEO'].title,
                                value: this.load.feo?.result.toString() || '',
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
                                value: this.load.grind?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setGrind.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['MOISTURE'].title,
                                value: this.load.moisture?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setMoisture.bind(this) },
                            },
                            {
                                type: 'COMMENT',
                                title: LaboratoryResultInfo['SULPHUR'].title,
                                value: this.load.sulphur?.result.toString() || '',
                                english: true,
                                button: { icon: 'calculate', click: this.setSulphur.bind(this) },
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
        buttons: [
            { title: 'حذف تمام نتایج', action: this.clear.bind(this) },
            { title: 'انصراف', action: () => this.router.navigate(['/load']) },
        ],
    };

    public standard?: ILaboratoryStandardDTO;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    setValue(col: number, row: number, value: string): void {
        const column = this.ngxForm.sections[0].columns[col];
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
            this.setValue(0, 0, this.fe?.result.toString() || '');
        });
    }

    setFeO(): void {
        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        this.laboratoryTestService.getFeO(this.standard.standard, this.feo).then((feo?: ILaboratoryTestFeODTO) => {
            this.feo = feo;
            this.setValue(0, 1, this.feo?.result.toString() || '');
        });
    }

    setGrind(): void {
        const type: 'FEED' | 'CONCENTRATE' = this.load.cargo.type === 'OUT' ? 'CONCENTRATE' : 'FEED';
        this.laboratoryTestService.getGrind(type, this.grind).then((grind?: ILaboratoryTestGrindDTO) => {
            this.grind = grind;
            this.setValue(1, 0, this.grind?.result.toString() || '');
        });
    }

    setMoisture(): void {
        this.laboratoryTestService.getMoisture(this.moisture).then((moisture?: ILaboratoryTestMoistureDTO) => {
            this.moisture = moisture;
            this.setValue(1, 1, this.moisture?.result.toString() || '');
        });
    }

    setSulphur(): void {
        this.laboratoryTestService.getSulphur(this.sulphur).then((sulphur?: ILaboratoryTestSulphurDTO) => {
            this.sulphur = sulphur;
            this.setValue(1, 2, this.sulphur?.result.toString() || '');
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.fe && !this.feo && !this.grind && !this.moisture && !this.sulphur) {
            this.ngxHelperToastService.error('هیچکدام از نتایح آزمایش مشخص نشده است.');
            return;
        }

        const ID: string = this.load.id;
        const body: ILaboratoryLoadUpdateRq = {
            fe: this.fe ? JSON.stringify(this.fe) : null,
            feo: this.feo ? JSON.stringify(this.feo) : null,
            grind: this.grind ? JSON.stringify(this.grind) : null,
            moisture: this.moisture ? JSON.stringify(this.moisture) : null,
            sulphur: this.sulphur ? JSON.stringify(this.sulphur) : null,
            description: values['description'],
        };
        this.apiService.request<ILaboratoryLoadUpdateRs>('LaboratoryLoadUpdate', { body, ids: { ID } }, () => {
            this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
            this.router.navigate(['/load']);
        });
    }

    clear(): void {
        if (!this.fe && !this.feo && !this.grind && !this.moisture && !this.sulphur) {
            this.ngxHelperToastService.error('هیچکدام از نتایح آزمایش مشخص نشده است.');
            return;
        }

        const item: string = 'نتایج آزمایش';
        const question: string = 'آیا می‌خواهید تمام نتایج ثبت شده را حذف کنید؟';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { question, message }, () => {
            const ID: string = this.load.id;
            this.apiService.request<ILaboratoryLoadClearRs>('LaboratoryLoadClear', { ids: { ID } }, () => {
                this.ngxHelperToastService.success('نتایچ آزمایش با موفقیت حذف شد.');
                this.router.navigate(['/load']);
            });
        });
    }
}
