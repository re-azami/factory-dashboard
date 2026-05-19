import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratorySupplementaryDTO,
    ILaboratorySupplementaryTestDeleteRs,
    ILaboratorySupplementaryTestDTO,
    ILaboratorySupplementaryTestListRs,
} from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';

@Component({
    host: { selector: 'supplementary-info' },
    standalone: false,
    templateUrl: './supplementary-info.component.html',
    styleUrl: './supplementary-info.component.scss',
})
export class SupplementaryInfoComponent implements OnInit {
    public supplementary: ILaboratorySupplementaryDTO = this.activatedRoute.snapshot.data['supplementary'];

    public roleAccess: boolean = this.userService.hasAccess({ access: 'LABORATORY_ROLE_SUPPLEMENTARY' });
    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای متفرقه',
        description: this.supplementary.title,
        actions: [
            ...(this.roleAccess
                ? [
                      {
                          type: 'CREATE' as 'CREATE',
                          title: 'ثبت نتیجه آزمایش',
                          action: ['/supplementary', this.supplementary.id, 'create'],
                      },
                  ]
                : []),
            { type: 'RETURN', action: ['/supplementary'] },
        ],
    };

    public loading: boolean = true;
    public tests: ILaboratorySupplementaryTestDTO[] = [];

    public activeTab: number = 0;
    public dateBlocks: IPageBlock[] = [];
    public feedBlocks: IPageBlock[][] = [];
    public gaussBlocks: IPageBlock[] = [];
    public productBlocks: IPageBlock[] = [];
    public tailBlocks: IPageBlock[] = [];

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.loadTests();
    }

    loadTests(): void {
        const SUPPLEMENTARYID: string = this.supplementary.id;
        this.apiService.request<ILaboratorySupplementaryTestListRs>(
            'LaboratorySupplementaryTestList',
            { ids: { SUPPLEMENTARYID } },
            (response) => {
                this.loading = false;
                this.tests = response;

                this.setActiveTab(0);
            },
        );
    }

    setActiveTab(activeTab: number): void {
        if (!this.tests[activeTab]) return;

        this.activeTab = activeTab;
        const test: ILaboratorySupplementaryTestDTO = this.tests[this.activeTab];

        const jalali = JalaliDateTime();
        this.dateBlocks = [{ title: 'تاریخ', value: jalali.toFullText(test.date, { format: 'W، d N Y' }) }];

        this.feedBlocks = [
            [
                { title: 'درصد FE', value: test.fe?.result || '' },
                { title: 'درصد FEO', value: test.feo?.result || '' },
            ],
            [
                { title: 'دانه‌بندی', value: test.grind?.result || '' },
                { title: 'رطوبت', value: test.moisture?.result || '' },
                { title: 'سولفور', value: test.sulphur?.result || '' },
            ],
        ];

        this.gaussBlocks = [
            { title: 'گاوس', value: test.gauss || '' },
            { title: 'ریکاوری', value: test.recovery?.result || '' },
        ];

        this.productBlocks = [
            { title: 'درصد FE', value: test.product?.fe?.result || '' },
            { title: 'درصد FEO', value: test.product?.feo?.result || '' },
        ];

        this.tailBlocks = [
            { title: 'درصد FE', value: test.tail?.fe?.result || '' },
            { title: 'درصد FEO', value: test.tail?.feo?.result || '' },
        ];

        this.changeDetectorRef.detectChanges();
    }

    update(index: number): void {
        if (!this.tests[index]) return;

        this.router.navigate(['/supplementary', this.supplementary.id, 'update', this.tests[index].id]);
    }

    delete(index: number): void {
        if (!this.tests[index]) return;

        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const SUPPLEMENTARYID: string = this.supplementary.id;
            const ID: string = this.tests[index].id;
            this.apiService.request<ILaboratorySupplementaryTestDeleteRs>(
                'LaboratorySupplementaryTestDelete',
                { ids: { SUPPLEMENTARYID, ID } },
                () => {
                    this.loading = true;
                    this.loadTests();
                    this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
                },
            );
        });
    }
}
