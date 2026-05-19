import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportCargoDraftRs, ILoadReportCargoInfoRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';

@Component({
    host: { selector: 'report-cargo-draft' },
    templateUrl: './report-cargo-draft.component.html',
    styleUrl: './report-cargo-draft.component.scss',
    standalone: false
})
export class ReportCargoDraftComponent {
    public info: ILoadReportCargoInfoRs = this.activatedRoute.snapshot.data['info'];

    public loading: boolean = true;
    public report!: ILoadReportCargoDraftRs;
    public reportBlock: IPageBlock[] = [];

    public formLoading: boolean = true;
    public from!: Date;
    public to!: Date;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadReport();
    }

    loadReport(): void {
        this.formLoading = true;

        const ID: string = this.info.cargo.id;
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILoadReportCargoDraftRs>(
            'LoadReportCargoDraft',
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
