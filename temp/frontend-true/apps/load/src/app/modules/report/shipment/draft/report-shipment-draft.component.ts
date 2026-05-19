import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportShipmentInfoRs, IّLoadReportShipmentDraftRs } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'report-shipment-draft' },
    templateUrl: './report-shipment-draft.component.html',
    styleUrl: './report-shipment-draft.component.scss',
    standalone: false
})
export class ReportShipmentDraftComponent implements OnInit {
    public info: ILoadReportShipmentInfoRs = this.activatedRoute.snapshot.data['info'];
    public title: IPageTitle = {
        title: 'گزارش محموله',
        actions: [{ title: 'انتخاب محموله', icon: 'inventory_2', action: ['/report', 'shipment'] }],
    };

    public shipmentBlock: IPageBlock[] = [
        { title: 'وضعیت', value: this.info.shipment.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
    ];
    public draftBlock: IPageBlock[] = [
        { title: 'تعداد کل حواله‌ها', value: this.info.draft.count },
        { title: 'وزن حواله‌ها', value: this.info.draft.weight },
    ];
    public datesBlock: IPageBlock[][] = [];
    public reportBlock: IPageBlock[] = [];

    public loading: boolean = true;
    public report!: IّLoadReportShipmentDraftRs;

    public formLoading: boolean = true;
    public from!: Date;
    public to!: Date;

    private jalali = JalaliDateTime();

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    ngOnInit(): void {
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

        const ID: string = this.info.shipment.id;
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<IّLoadReportShipmentDraftRs>(
            'LoadReportShipmentDraft',
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
