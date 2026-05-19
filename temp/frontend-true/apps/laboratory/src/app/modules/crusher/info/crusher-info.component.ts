import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import {
    ApiService,
    ILaboratoryCrusherDeleteRs,
    ILaboratoryCrusherDTO,
    ILaboratoryCrusherTestDeleteRs,
    ILaboratoryCrusherTestDTO,
    ILaboratoryCrusherTestFeORq,
    ILaboratoryCrusherTestFeORs,
    ILaboratoryCrusherTestFeRq,
    ILaboratoryCrusherTestFeRs,
    ILaboratoryCrusherTestGrindRq,
    ILaboratoryCrusherTestGrindRs,
    ILaboratoryCrusherTestMoistureRq,
    ILaboratoryCrusherTestMoistureRs,
    ILaboratoryCrusherTestSulphurRq,
    ILaboratoryCrusherTestSulphurRs,
    ILaboratoryStandardDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
    IOptionDTO,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { SettingService } from '@lib/providers';
import {
    LaboratoryCrusher,
    LaboratoryCrusherInfo,
    LaboratoryCrusherList,
    LaboratoryLineInfo,
    LaboratoryResult,
    LaboratoryResultInfo,
    LoadCargoInfo,
} from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

import { CrusherUpdateComponent } from '../update/crusher-update.component';

@Component({
    host: { selector: 'crusher-info' },
    templateUrl: './crusher-info.component.html',
    styleUrl: './crusher-info.component.scss',
    standalone: false,
})
export class CrusherInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryCrusherList = LaboratoryCrusherList;
    public laboratoryCrusherInfo = LaboratoryCrusherInfo;

    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];
    public crusher: ILaboratoryCrusherDTO = this.activatedRoute.snapshot.data['crusher'];

    public title: IPageTitle = {
        title: 'مدیریت نتایج آزمایش سنگ شکن',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratoryCrusherLog', this.crusher.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/crusher'] },
        ],
    };

    public buttons: IPageCardButton[] = [
        { title: 'ویرایش', icon: 'edit', action: this.update.bind(this) },
        { title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' },
    ];
    public blocks: IPageBlock[][] = [];

    public standard?: ILaboratoryStandardDTO;
    public tests: Partial<{ [key in LaboratoryCrusher]: ILaboratoryCrusherTestDTO | undefined }> = {};

    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly clipboard: Clipboard,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
        private readonly settingService: SettingService,
    ) {}

    ngOnInit(): void {
        this.setData();
    }

    setData(): void {
        const mixed: boolean = !!this.crusher.cargo && this.crusher.cargo.portions.length > 0;
        this.blocks = [
            [
                { title: 'خط', value: LaboratoryLineInfo[this.crusher.line].title },
                {
                    title: 'ساعات کارکرد',
                    value:
                        this.jalali.toFullText(this.crusher.time.begin, { format: 'H:I' }) +
                        ' تا ' +
                        this.jalali.toFullText(this.crusher.time.end, { format: 'H:I' }),
                },
            ],
            [
                { title: 'تناژ خوراک', value: this.crusher.tonnage.feed },
                { title: 'تناژ تولید', value: this.crusher.tonnage.product },
                { title: 'گاوس ۱۲۰۰', value: this.crusher.tonnage.gauss1200 },
                { title: 'گاوس ۲۰۰۰', value: this.crusher.tonnage.gauss2000 },
                { title: 'تناژ باطله', value: this.crusher.tonnage.tail },
            ],
            [
                {
                    title: `بار ${mixed ? ' مخلوط' : ''}`,
                    value: this.crusher.cargo?.title || '',
                    english: mixed,
                    ltr: mixed,
                },
                { title: 'نوع بار', value: this.crusher.cargo?.type ? LoadCargoInfo[this.crusher.cargo.type].title : '' },
            ],
            [
                { title: 'طرف حساب', value: this.crusher.cargo?.party?.title || '' },
                { title: 'محموله', value: this.crusher.cargo?.shipment?.title || '' },
            ],
        ];

        LaboratoryCrusherList.forEach((test) => (this.tests[test] = this.crusher.tests.find((t) => t.test === test)));
    }

    isDisabled(test: LaboratoryCrusher, result: LaboratoryResult): boolean {
        const check: string = `${test}::${result}`;
        return (this.settingService.laboratory.crusher || []).includes(check);
    }

    update(): void {
        this.ngxHelperBottomSheetService.open<ILaboratoryCrusherDTO>(
            CrusherUpdateComponent,
            'ویرایش نتیجه آزمایش سنگ شکن',
            { data: { cargos: this.cargos, crusher: this.crusher } },
            (response) => {
                this.crusher = response;
                this.setData();

                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
            },
        );
    }

    delete(): void {
        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.crusher.id;
            this.apiService.request<ILaboratoryCrusherDeleteRs>('LaboratoryCrusherDelete', { ids: { ID } }, () => {
                this.router.navigate(['/crusher']);
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }

    getMenu(test: LaboratoryCrusher, result: LaboratoryResult): NgxHelperMenu[] {
        if (this.isDisabled(test, result)) return [];

        let copy: number;
        let editFn: (test: LaboratoryCrusher) => void;
        switch (result) {
            case 'FE':
                if (!this.tests[test]?.fe) return [];

                copy = this.tests[test].fe.result;
                editFn = this.setFe.bind(this);
                break;

            case 'FEO':
                if (!this.tests[test]?.feo) return [];

                copy = this.tests[test].feo.result;
                editFn = this.setFeO.bind(this);
                break;

            case 'GRIND':
                if (!this.tests[test]?.grind) return [];

                copy = this.tests[test].grind.result;
                editFn = this.setGrind.bind(this);
                break;

            case 'MOISTURE':
                if (!this.tests[test]?.moisture) return [];

                copy = this.tests[test].moisture.result;
                editFn = this.setMoisture.bind(this);
                break;
        }

        return [
            {
                icon: 'content_copy',
                title: 'کپی مقدار',
                click: () => {
                    this.clipboard.copy(copy.toString());
                    this.ngxHelperToastService.success('نتیجه آزمایش در کلیپ‌بورد کپی شد.', 1);
                },
            },
            'DIVIDER',
            { icon: 'edit', title: 'ویرایش', click: () => editFn(test) },
            { icon: 'delete', title: 'حذف', click: () => this.deleteTest(test, result), color: 'warn' },
        ];
    }

    setFe(test: LaboratoryCrusher): void {
        if (this.isDisabled(test, 'FE')) return;

        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        const fe = this.tests[test]?.fe || undefined;
        this.laboratoryTestService
            .getFe(this.standard.standard, fe, LaboratoryCrusherInfo[test].title)
            .then((result?: ILaboratoryTestFeDTO) => {
                if (!result) return;

                const ID: string = this.crusher.id;
                const body: ILaboratoryCrusherTestFeRq = { test, fe: JSON.stringify(result) };
                this.apiService.request<ILaboratoryCrusherTestFeRs>(
                    'LaboratoryCrusherTestFe',
                    { body, ids: { ID } },
                    (response) => {
                        this.crusher = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setFeO(test: LaboratoryCrusher): void {
        if (this.isDisabled(test, 'FEO')) return;

        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        const feo = this.tests[test]?.feo || undefined;
        this.laboratoryTestService
            .getFeO(this.standard.standard, feo, LaboratoryCrusherInfo[test].title)
            .then((result?: ILaboratoryTestFeODTO) => {
                if (!result) return;

                const ID: string = this.crusher.id;
                const body: ILaboratoryCrusherTestFeORq = { test, feo: JSON.stringify(result) };
                this.apiService.request<ILaboratoryCrusherTestFeORs>(
                    'LaboratoryCrusherTestFeO',
                    { body, ids: { ID } },
                    (response) => {
                        this.crusher = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setGrind(test: LaboratoryCrusher): void {
        if (this.isDisabled(test, 'GRIND')) return;

        const grind = this.tests[test]?.grind || undefined;
        this.laboratoryTestService
            .getGrind('NONE', grind, LaboratoryCrusherInfo[test].title)
            .then((result?: ILaboratoryTestGrindDTO) => {
                if (!result) return;

                const ID: string = this.crusher.id;
                const body: ILaboratoryCrusherTestGrindRq = { test, grind: JSON.stringify(result) };
                this.apiService.request<ILaboratoryCrusherTestGrindRs>(
                    'LaboratoryCrusherTestGrind',
                    { body, ids: { ID } },
                    (response) => {
                        this.crusher = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setMoisture(test: LaboratoryCrusher): void {
        if (this.isDisabled(test, 'MOISTURE')) return;

        const moisture = this.tests[test]?.moisture || undefined;
        this.laboratoryTestService
            .getMoisture(moisture, LaboratoryCrusherInfo[test].title)
            .then((result?: ILaboratoryTestMoistureDTO) => {
                if (!result) return;

                const ID: string = this.crusher.id;
                const body: ILaboratoryCrusherTestMoistureRq = { test, moisture: JSON.stringify(result) };
                this.apiService.request<ILaboratoryCrusherTestMoistureRs>(
                    'LaboratoryCrusherTestMoisture',
                    { body, ids: { ID } },
                    (response) => {
                        this.crusher = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setSulphur(test: LaboratoryCrusher): void {
        if (this.isDisabled(test, 'SULPHUR')) return;

        const sulphur = this.tests[test]?.sulphur || undefined;
        this.laboratoryTestService
            .getSulphur(sulphur, LaboratoryCrusherInfo[test].title)
            .then((result?: ILaboratoryTestSulphurDTO) => {
                if (!result) return;

                const ID: string = this.crusher.id;
                const body: ILaboratoryCrusherTestSulphurRq = { test, sulphur: JSON.stringify(result) };
                this.apiService.request<ILaboratoryCrusherTestSulphurRs>(
                    'LaboratoryCrusherTestSulphur',
                    { body, ids: { ID } },
                    (response) => {
                        this.crusher = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    deleteTest(test: LaboratoryCrusher, result: LaboratoryResult): void {
        const item: string = 'نتیجه آزمایش';
        const title: string = `${LaboratoryCrusherInfo[test].title} :: ${LaboratoryResultInfo[result].title}`;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = this.crusher.id;
            const TEST: string = test;
            const RESULT: string = result;
            this.apiService.request<ILaboratoryCrusherTestDeleteRs>(
                'LaboratoryCrusherTestDelete',
                { ids: { ID, TEST, RESULT } },
                (response) => {
                    this.crusher = response;
                    this.setData();

                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
                },
            );
        });
    }
}
