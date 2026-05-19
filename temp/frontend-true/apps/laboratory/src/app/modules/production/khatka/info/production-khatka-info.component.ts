import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryKhatkaDeleteRs,
    ILaboratoryKhatkaDTO,
    ILaboratoryKhatkaTestDTO,
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

import { LaboratoryTestService } from '../../../../providers';

import { ProductionKhatkaUpdateComponent } from '../update/production-khatka-update.component';

@Component({
    host: { selector: 'production-khatka-info' },
    standalone: false,
    templateUrl: './production-khatka-info.component.html',
    styleUrl: './production-khatka-info.component.scss',
})
export class ProductionKhatkaInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryKhatkaList = LaboratoryKhatkaList;
    public laboratoryKhatkaInfo = LaboratoryKhatkaInfo;

    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];
    public khatka: ILaboratoryKhatkaDTO = this.activatedRoute.snapshot.data['khatka'];

    public title: IPageTitle = {
        title: 'تولید ختکا',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratoryKhatkaLog', this.khatka.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/production', 'khatka'] },
        ],
    };

    public buttons: IPageCardButton[] = [];
    public blocks: IPageBlock[][] = [];
    public tests: Partial<{ [key in LaboratoryKhatka]: ILaboratoryKhatkaTestDTO | undefined }> = {};

    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly settingService: SettingService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnInit(): void {
        this.setData();
    }

    setData(): void {
        this.buttons = [{ title: 'ویرایش', icon: 'edit', action: this.update.bind(this) }];
        if (this.khatka.count === 0)
            this.buttons.push({ title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' });

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
            ProductionKhatkaUpdateComponent,
            'ویرایش تولید ختکا',
            { data: { cargos: this.cargos, khatka: this.khatka } },
            (response) => {
                this.khatka = response;
                this.setData();

                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت ویرایش شد.');
            },
        );
    }

    delete(): void {
        const item: string = 'اطلاعات تولید';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.khatka.id;
            this.apiService.request<ILaboratoryKhatkaDeleteRs>('LaboratoryKhatkaDelete', { ids: { ID } }, () => {
                this.router.navigate(['/production', 'khatka']);
                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت حذف شد.');
            });
        });
    }
}
