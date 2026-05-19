import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportTruckDraftRs, ILoadReportTruckInfoRs } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'report-truck' },
    templateUrl: './report-truck.component.html',
    styleUrl: './report-truck.component.scss',
    standalone: false
})
export class ReportTruckComponent implements OnInit {
    public getPlate = this.loadToolsService.getPlate;

    public info: ILoadReportTruckInfoRs = this.activatedRoute.snapshot.data['info'];
    public title: IPageTitle = {
        title: 'گزارش ناوگان',
        actions: [
            {
                title: 'انتخاب ناوگان',
                icon: 'local_shipping',
                action: () =>
                    this.loadToolsService.selectTruck((truck) => this.router.navigate(['/report', 'truck', truck.id])),
            },
        ],
    };

    public truckBlock: IPageBlock[] = [];
    public draftBlock: IPageBlock[] = [];
    public datesBlock: IPageBlock[][] = [];
    public reportBlock: IPageBlock[] = [];

    public loading: boolean = true;
    public report!: ILoadReportTruckDraftRs;

    public formLoading: boolean = true;
    public from!: Date;
    public to!: Date;

    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.setData();
        this.activatedRoute.data.subscribe({
            next: (data: Data) => {
                this.info = data['info'];
                this.setData();
            },
        });
    }

    setData(): void {
        this.truckBlock = [
            { title: 'وضعیت', value: this.info.truck.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
            { title: 'مالک', value: this.info.truck.owner.name },
            { title: 'راننده', value: `${this.info.truck.driver.name.first} ${this.info.truck.driver.name.last}` },
        ];
        this.draftBlock = [
            { title: 'تعداد کل حواله‌ها', value: this.info.draft.count },
            { title: 'وزن حواله‌ها', value: this.info.draft.weight },
        ];

        if (!this.info.draft.count) return;

        const format: string = 'W، d N Y H:I';
        this.datesBlock = [
            [{ title: 'اولین حواله', value: this.jalali.toFullText(this.info.draft.first, { format }) }],
            [{ title: 'آخرین حواله', value: this.jalali.toFullText(this.info.draft.last, { format }) }],
        ];
    }

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadReport();
    }

    loadReport(): void {
        this.formLoading = true;

        const ID: string = this.info.truck.id;
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILoadReportTruckDraftRs>(
            'LoadReportTruckDraft',
            { ids: { ID }, params: { from, to } },
            (response) => {
                this.loading = false;
                this.formLoading = false;
                this.report = response;

                this.reportBlock = [
                    { title: 'حواله', value: this.report.count },
                    { title: 'وزن', value: this.report.weight },
                ];
            },
        );
    }
}
