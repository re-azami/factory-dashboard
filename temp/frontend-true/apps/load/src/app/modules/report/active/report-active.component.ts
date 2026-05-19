import { Component, OnInit } from '@angular/core';

import { ApiService, ILoadCargoDTO, ILoadReportActiveDTO, ILoadReportActiveRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'report-active' },
    templateUrl: './report-active.component.html',
    styleUrl: './report-active.component.scss',
    standalone: false
})
export class ReportActiveComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public title: IPageTitle = { title: 'گزارش بارهای فعال' };

    public loading: boolean = true;
    public report: ILoadReportActiveDTO[] = [];

    public active: ILoadReportActiveDTO[] = [];
    public future: ILoadReportActiveDTO[] = [];

    constructor(private readonly apiService: ApiService, private readonly loadToolsService: LoadToolsService) {}

    ngOnInit(): void {
        this.apiService.request<ILoadReportActiveRs>('LoadReportActive', (response) => {
            this.loading = false;
            this.report = response;

            this.active = this.report.filter((r) => r.cargo.status === 'ACTIVE');
            this.future = this.report.filter((r) => r.cargo.status === 'FUTURE');
        });
    }

    letter(data: ILoadReportActiveDTO): void {
        const cargo: ILoadCargoDTO = data.cargo;
        if (!cargo.letter) return;

        this.loadToolsService.downloadFile(cargo.letter.path, cargo.title);
    }
}
