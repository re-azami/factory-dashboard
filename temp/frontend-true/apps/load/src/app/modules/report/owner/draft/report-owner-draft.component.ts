import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportOwnerDraftRs, ILoadReportOwnerInfoRs } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'report-owner-draft' },
    templateUrl: './report-owner-draft.component.html',
    styleUrl: './report-owner-draft.component.scss',
    standalone: false
})
export class ReportOwnerDraftComponent implements OnInit {
    public info: ILoadReportOwnerInfoRs = this.activatedRoute.snapshot.data['info'];
    public title: IPageTitle = {
        title: 'گزارش مالک',
        actions: [{ title: 'انتخاب مالک', icon: 'badge', action: ['/report', 'owner'] }],
    };

    public ownerBlock: IPageBlock[] = [
        { title: 'وضعیت', value: this.info.owner.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
        { title: 'موبایل', value: Helper.STRING.getMobileView(this.info.owner.mobile), english: true },
        { title: 'کدملی', value: this.info.owner.nationalCode, english: true },
    ];
    public draftBlock: IPageBlock[] = [
        { title: 'تعداد کل حواله‌ها', value: this.info.draft.count },
        { title: 'وزن حواله‌ها', value: this.info.draft.weight },
    ];
    public datesBlock: IPageBlock[][] = [];
    public reportBlock: IPageBlock[] = [];

    public loading: boolean = true;
    public report!: ILoadReportOwnerDraftRs;

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

        const ID: string = this.info.owner.id;
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILoadReportOwnerDraftRs>(
            'LoadReportOwnerDraft',
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
