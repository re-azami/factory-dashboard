import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratorySolidDeleteRs,
    ILaboratorySolidDTO,
    ILaboratorySolidTestCreateRq,
    ILaboratorySolidTestCreateRs,
    ILaboratorySolidTestDeleteRs,
    ILaboratorySolidTestDTO,
    ILaboratorySolidTestUpdateRq,
    ILaboratorySolidTestUpdateRs,
    IOptionDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { LaboratoryLineInfo, LaboratorySolid, LaboratorySolidInfo, LaboratorySolidList, LoadCargoInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

import { SolidUpdateComponent } from '../update/solid-update.component';

@Component({
    host: { selector: 'solid-info' },
    templateUrl: './solid-info.component.html',
    styleUrl: './solid-info.component.scss',
    standalone: false
})
export class SolidInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];
    public solid: ILaboratorySolidDTO = this.activatedRoute.snapshot.data['solid'];

    public title: IPageTitle = {
        title: 'مدیریت نتایج آزمایش درصد جامد',
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.laboratoryTestService.showLog('LaboratorySolidLog', this.solid.id),
                access: { access: 'LABORATORY_LOG' },
            },
            { type: 'RETURN', action: ['/solid'] },
        ],
    };

    public buttons: IPageCardButton[] = [
        { title: 'ویرایش', icon: 'edit', action: this.update.bind(this) },
        { title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' },
    ];
    public blocks: IPageBlock[][] = [];

    public tests: ILaboratorySolidTestDTO[] = [];
    public list: IList<ILaboratorySolidTestDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            { title: 'تست', value: (data) => LaboratorySolidInfo[data.test].title },
            {
                title: 'وزن پالپ',
                value: (data) => (data.container ? +(data.container.pulp - data.container.weight).toFixed(3) : undefined),
                type: 'NUMBER',
            },
            {
                title: 'وزن جامد',
                value: (data) => (data.oven ? +(data.oven.solid - data.oven.weight).toFixed(3) : undefined),
                type: 'NUMBER',
            },
            { title: 'دانسیته', value: 'density', type: 'NUMBER' },
            { title: 'درصد جامد', value: 'result', type: 'NUMBER' },
        ],
        actions: [
            {
                title: 'ثبت نتیجه',
                icon: 'biotech',
                action: (data: ILaboratorySolidTestDTO) => this.createTest(data.test),
                hideOn: (data) => !!data.result,
            },
            { type: 'UPDATE', action: this.updateTest.bind(this), hideOn: (data) => !data.result },
            { type: 'DELETE', action: this.deleteTest.bind(this), hideOn: (data) => !data.result },
        ],
    };

    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnInit(): void {
        this.setData();
    }

    setData(): void {
        const mixed: boolean = !!this.solid.cargo && this.solid.cargo.portions.length > 0;
        this.blocks = [
            [
                { title: 'خط', value: LaboratoryLineInfo[this.solid.line].title },
                {
                    title: 'ساعات کارکرد',
                    value:
                        this.jalali.toFullText(this.solid.time.begin, { format: 'H:I' }) +
                        ' تا ' +
                        this.jalali.toFullText(this.solid.time.end, { format: 'H:I' }),
                },
            ],
            [
                {
                    title: `بار ${mixed ? ' مخلوط' : ''}`,
                    value: this.solid.cargo?.title || '',
                    english: mixed,
                    ltr: mixed,
                },
                { title: 'نوع بار', value: this.solid.cargo?.type ? LoadCargoInfo[this.solid.cargo.type].title : '' },
            ],
            [
                { title: 'طرف حساب', value: this.solid.cargo?.party?.title || '' },
                { title: 'محموله', value: this.solid.cargo?.shipment?.title || '' },
            ],
        ];

        this.tests = [];
        LaboratorySolidList.forEach((test) => {
            const result = this.solid.tests.find((t) => t.test === test);
            if (result) this.tests.push(result);
            else this.tests.push({ test, container: null, oven: null, density: null, result: null } as any);
        });
    }

    update(): void {
        this.ngxHelperBottomSheetService.open<ILaboratorySolidDTO>(
            SolidUpdateComponent,
            'ویرایش نتیجه آزمایش درصد جامد',
            { data: { cargos: this.cargos, solid: this.solid } },
            (response) => {
                this.solid = response;
                this.setData();

                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
            },
        );
    }

    delete(): void {
        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.solid.id;
            this.apiService.request<ILaboratorySolidDeleteRs>('LaboratorySolidDelete', { ids: { ID } }, () => {
                this.router.navigate(['/solid']);
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }

    createTest(test: LaboratorySolid): void {
        this.laboratoryTestService.getSolid(test).then((result?: ILaboratorySolidTestDTO) => {
            if (!result) return;

            const ID: string = this.solid.id;
            const body: ILaboratorySolidTestCreateRq = {
                test,
                container: { weight: result.container.weight, pulp: result.container.pulp },
                oven: { weight: result.oven.weight, solid: result.oven.solid },
                density: result.density,
                result: result.result,
            };
            this.apiService.request<ILaboratorySolidTestCreateRs>(
                'LaboratorySolidTestCreate',
                { body, ids: { ID } },
                (solid) => {
                    this.solid = solid;
                    this.setData();

                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
                },
            );
        });
    }

    updateTest(test: ILaboratorySolidTestDTO): void {
        this.laboratoryTestService.getSolid(test.test, test).then((result?: ILaboratorySolidTestDTO) => {
            if (!result) return;

            const ID: string = this.solid.id;
            const body: ILaboratorySolidTestUpdateRq = {
                test: test.test,
                container: { weight: result.container.weight, pulp: result.container.pulp },
                oven: { weight: result.oven.weight, solid: result.oven.solid },
                density: result.density,
                result: result.result,
            };
            this.apiService.request<ILaboratorySolidTestUpdateRs>(
                'LaboratorySolidTestUpdate',
                { body, ids: { ID } },
                (solid) => {
                    this.solid = solid;
                    this.setData();

                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
                },
            );
        });
    }

    deleteTest(test: ILaboratorySolidTestDTO): void {
        const item: string = 'نتیجه آزمایش';
        const title: string = LaboratorySolidInfo[test.test].title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = this.solid.id;
            const TEST: string = test.test;
            this.apiService.request<ILaboratorySolidTestDeleteRs>(
                'LaboratorySolidTestDelete',
                { ids: { ID, TEST } },
                (solid) => {
                    this.solid = solid;
                    this.setData();

                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
                },
            );
        });
    }
}
