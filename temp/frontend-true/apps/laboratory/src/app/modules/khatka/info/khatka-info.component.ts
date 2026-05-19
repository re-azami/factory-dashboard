import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import {
    ApiService,
    ILaboratoryKhatkaDeleteRs,
    ILaboratoryKhatkaDTO,
    ILaboratoryKhatkaTestDeleteRs,
    ILaboratoryKhatkaTestDTO,
    ILaboratoryKhatkaTestFeORq,
    ILaboratoryKhatkaTestFeORs,
    ILaboratoryKhatkaTestFeRq,
    ILaboratoryKhatkaTestFeRs,
    ILaboratoryKhatkaTestGrindRq,
    ILaboratoryKhatkaTestGrindRs,
    ILaboratoryKhatkaTestMoistureRq,
    ILaboratoryKhatkaTestMoistureRs,
    ILaboratoryKhatkaTestSulphurRq,
    ILaboratoryKhatkaTestSulphurRs,
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
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
    LaboratoryLineInfo,
    LaboratoryResult,
    LaboratoryResultInfo,
    LoadCargoInfo,
} from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

import { KhatkaUpdateComponent } from '../update/khatka-update.component';

@Component({
    host: { selector: 'khatka-info' },
    templateUrl: './khatka-info.component.html',
    styleUrl: './khatka-info.component.scss',
    standalone: false
})
export class KhatkaInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryKhatkaList = LaboratoryKhatkaList;
    public laboratoryKhatkaInfo = LaboratoryKhatkaInfo;

    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];
    public khatka: ILaboratoryKhatkaDTO = this.activatedRoute.snapshot.data['khatka'];

    public title: IPageTitle = {
        title: 'مدیریت نتایج آزمایش ختکا',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratoryKhatkaLog', this.khatka.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/khatka'] },
        ],
    };

    public buttons: IPageCardButton[] = [
        { title: 'ویرایش', icon: 'edit', action: this.update.bind(this) },
        { title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' },
    ];
    public blocks: IPageBlock[][] = [];

    public standard?: ILaboratoryStandardDTO;
    public tests: Partial<{ [key in LaboratoryKhatka]: ILaboratoryKhatkaTestDTO | undefined }> = {};

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
        const mixed: boolean = !!this.khatka.cargo && this.khatka.cargo.portions.length > 0;
        this.blocks = [
            [
                { title: 'خط', value: LaboratoryLineInfo[this.khatka.line].title },
                {
                    title: 'ساعات کارکرد',
                    value:
                        this.jalali.toFullText(this.khatka.time.begin, { format: 'H:I' }) +
                        ' تا ' +
                        this.jalali.toFullText(this.khatka.time.end, { format: 'H:I' }),
                },
            ],
            [
                { title: 'تناژ خوراک', value: this.khatka.tonnage.feed },
                { title: 'تناژ تولید', value: this.khatka.tonnage.product },
            ],
            [
                {
                    title: `بار ${mixed ? ' مخلوط' : ''}`,
                    value: this.khatka.cargo?.title || '',
                    english: mixed,
                    ltr: mixed,
                },
                { title: 'نوع بار', value: this.khatka.cargo?.type ? LoadCargoInfo[this.khatka.cargo.type].title : '' },
            ],
            [
                { title: 'طرف حساب', value: this.khatka.cargo?.party?.title || '' },
                { title: 'محموله', value: this.khatka.cargo?.shipment?.title || '' },
            ],
        ];

        LaboratoryKhatkaList.forEach((test) => (this.tests[test] = this.khatka.tests.find((t) => t.test === test)));
    }

    isDisabled(test: LaboratoryKhatka, result: LaboratoryResult): boolean {
        const check: string = `${test}::${result}`;
        return (this.settingService.laboratory.khatka || []).includes(check);
    }

    update(): void {
        this.ngxHelperBottomSheetService.open<ILaboratoryKhatkaDTO>(
            KhatkaUpdateComponent,
            'ویرایش نتیجه آزمایش ختکا',
            { data: { cargos: this.cargos, khatka: this.khatka } },
            (response) => {
                this.khatka = response;
                this.setData();

                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
            },
        );
    }

    delete(): void {
        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.khatka.id;
            this.apiService.request<ILaboratoryKhatkaDeleteRs>('LaboratoryKhatkaDelete', { ids: { ID } }, () => {
                this.router.navigate(['/khatka']);
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }

    getMenu(test: LaboratoryKhatka, result: LaboratoryResult): NgxHelperMenu[] {
        if (this.isDisabled(test, result)) return [];

        let copy: number;
        let editFn: (test: LaboratoryKhatka) => void;
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

    setFe(test: LaboratoryKhatka): void {
        if (this.isDisabled(test, 'FE')) return;

        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        const fe = this.tests[test]?.fe || undefined;
        this.laboratoryTestService
            .getFe(this.standard.standard, fe, LaboratoryKhatkaInfo[test].title)
            .then((result?: ILaboratoryTestFeDTO) => {
                if (!result) return;

                const ID: string = this.khatka.id;
                const body: ILaboratoryKhatkaTestFeRq = { test, fe: JSON.stringify(result) };
                this.apiService.request<ILaboratoryKhatkaTestFeRs>(
                    'LaboratoryKhatkaTestFe',
                    { body, ids: { ID } },
                    (response) => {
                        this.khatka = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setFeO(test: LaboratoryKhatka): void {
        if (this.isDisabled(test, 'FEO')) return;

        if (!this.standard) {
            this.ngxHelperToastService.error('مقدار استاندارد مشخص نشده است.');
            return;
        }

        const feo = this.tests[test]?.feo || undefined;
        this.laboratoryTestService
            .getFeO(this.standard.standard, feo, LaboratoryKhatkaInfo[test].title)
            .then((result?: ILaboratoryTestFeODTO) => {
                if (!result) return;

                const ID: string = this.khatka.id;
                const body: ILaboratoryKhatkaTestFeORq = { test, feo: JSON.stringify(result) };
                this.apiService.request<ILaboratoryKhatkaTestFeORs>(
                    'LaboratoryKhatkaTestFeO',
                    { body, ids: { ID } },
                    (response) => {
                        this.khatka = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setGrind(test: LaboratoryKhatka): void {
        if (this.isDisabled(test, 'GRIND')) return;

        const grind = this.tests[test]?.grind || undefined;
        this.laboratoryTestService
            .getGrind(LaboratoryKhatkaInfo[test].grind, grind, LaboratoryKhatkaInfo[test].title)
            .then((result?: ILaboratoryTestGrindDTO) => {
                if (!result) return;

                const ID: string = this.khatka.id;
                const body: ILaboratoryKhatkaTestGrindRq = { test, grind: JSON.stringify(result) };
                this.apiService.request<ILaboratoryKhatkaTestGrindRs>(
                    'LaboratoryKhatkaTestGrind',
                    { body, ids: { ID } },
                    (response) => {
                        this.khatka = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setMoisture(test: LaboratoryKhatka): void {
        if (this.isDisabled(test, 'MOISTURE')) return;

        const moisture = this.tests[test]?.moisture || undefined;
        this.laboratoryTestService
            .getMoisture(moisture, LaboratoryKhatkaInfo[test].title)
            .then((result?: ILaboratoryTestMoistureDTO) => {
                if (!result) return;

                const ID: string = this.khatka.id;
                const body: ILaboratoryKhatkaTestMoistureRq = { test, moisture: JSON.stringify(result) };
                this.apiService.request<ILaboratoryKhatkaTestMoistureRs>(
                    'LaboratoryKhatkaTestMoisture',
                    { body, ids: { ID } },
                    (response) => {
                        this.khatka = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    setSulphur(test: LaboratoryKhatka): void {
        if (this.isDisabled(test, 'SULPHUR')) return;

        const sulphur = this.tests[test]?.sulphur || undefined;
        this.laboratoryTestService
            .getSulphur(sulphur, LaboratoryKhatkaInfo[test].title)
            .then((result?: ILaboratoryTestSulphurDTO) => {
                if (!result) return;

                const ID: string = this.khatka.id;
                const body: ILaboratoryKhatkaTestSulphurRq = { test, sulphur: JSON.stringify(result) };
                this.apiService.request<ILaboratoryKhatkaTestSulphurRs>(
                    'LaboratoryKhatkaTestSulphur',
                    { body, ids: { ID } },
                    (response) => {
                        this.khatka = response;
                        this.setData();

                        this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                    },
                );
            });
    }

    deleteTest(test: LaboratoryKhatka, result: LaboratoryResult): void {
        const item: string = 'نتیجه آزمایش';
        const title: string = `${LaboratoryKhatkaInfo[test].title} :: ${LaboratoryResultInfo[result].title}`;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = this.khatka.id;
            const TEST: string = test;
            const RESULT: string = result;
            this.apiService.request<ILaboratoryKhatkaTestDeleteRs>(
                'LaboratoryKhatkaTestDelete',
                { ids: { ID, TEST, RESULT } },
                (response) => {
                    this.khatka = response;
                    this.setData();

                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
                },
            );
        });
    }
}
