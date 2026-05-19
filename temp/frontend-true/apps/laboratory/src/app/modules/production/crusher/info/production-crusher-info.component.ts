import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryCrusherDeleteRs,
    ILaboratoryCrusherDTO,
    ILaboratoryCrusherTestDTO,
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

import { LaboratoryTestService } from '../../../..//providers';

import { ProductionCrusherUpdateComponent } from '../update/production-crusher-update.component';

@Component({
    host: { selector: 'production-crusher-info' },
    standalone: false,
    templateUrl: './production-crusher-info.component.html',
    styleUrl: './production-crusher-info.component.scss',
})
export class ProductionCrusherInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryCrusherList = LaboratoryCrusherList;
    public laboratoryCrusherInfo = LaboratoryCrusherInfo;

    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];
    public crusher: ILaboratoryCrusherDTO = this.activatedRoute.snapshot.data['crusher'];

    public buttons: IPageCardButton[] = [];
    public blocks: IPageBlock[][] = [];
    public tests: Partial<{ [key in LaboratoryCrusher]: ILaboratoryCrusherTestDTO | undefined }> = {};

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

    public title: IPageTitle = {
        title: 'تولید سنگ شکن',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratoryCrusherLog', this.crusher.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/production', 'crusher'] },
        ],
    };

    ngOnInit(): void {
        this.setData();
    }

    setData(): void {
        this.buttons = [{ title: 'ویرایش', icon: 'edit', action: this.update.bind(this) }];
        if (this.crusher.count === 0)
            this.buttons.push({ title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' });

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
            ProductionCrusherUpdateComponent,
            'ویرایش تولید سنگ شکن',
            { data: { cargos: this.cargos, crusher: this.crusher } },
            (response) => {
                this.crusher = response;
                this.setData();

                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت ویرایش شد.');
            },
        );
    }

    delete(): void {
        const item: string = 'اطلاعات تولید';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.crusher.id;
            this.apiService.request<ILaboratoryCrusherDeleteRs>('LaboratoryCrusherDelete', { ids: { ID } }, () => {
                this.router.navigate(['/production', 'crusher']);
                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت حذف شد.');
            });
        });
    }
}
