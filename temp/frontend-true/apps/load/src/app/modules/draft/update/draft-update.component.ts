import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, ILoadDraftDTO, ILoadDraftLogDTO, ILoadDraftLogRs, IOptionDTO } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'draft-update' },
    templateUrl: './draft-update.component.html',
    styleUrl: './draft-update.component.scss',
    standalone: false
})
export class DraftUpdateComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public draft: ILoadDraftDTO = this.activatedRoute.snapshot.data['draft'];
    public transporters: IOptionDTO[] = this.activatedRoute.snapshot.data['transporters'];

    public title: IPageTitle = { title: 'ویرایش حواله' };

    public activeTab: number = 0;

    private jalali = JalaliDateTime();
    public draftData: IPageBlock[] = [];
    public dateData: IPageBlock[] = [];
    public weightData: IPageBlock[] = [];
    public paymentData: IPageBlock[][] = [];

    public logLoading: boolean = true;
    public logs: ILoadDraftLogDTO[] = [];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe({
            next: (data: Data) => {
                this.draft = data['draft'];
                this.setData();
            },
        });
    }

    setData(): void {
        this.activeTab = 0;
        this.loadLogs();

        const format: string = 'W، d N Y H:I';
        const status: string =
            this.draft.status === 'ACTIVE' ? 'فعال' : this.draft.status === 'CANCELED' ? 'لغو شده' : 'پایان فرایند';

        this.draftData = [
            { title: 'شماره حواله', value: this.draft.code, english: true },
            { title: 'وضعیت', value: status, color: 'warn' },
        ];
        this.dateData = [
            { title: 'تاریخ ثبت', value: this.jalali.toFullText(this.draft.date.create, { format }) },
            this.draft.status === 'FINISHED'
                ? { title: 'پایان فرایند', value: this.jalali.toFullText(this.draft.date.finish, { format }) }
                : { title: 'آخرین تغییر', value: this.jalali.toFullText(this.draft.date.update, { format }) },
        ];
        this.weightData = [
            { title: 'وزن خالص', value: this.draft.weight.net },
            { title: 'وزن پر', value: this.draft.weight.full },
            { title: 'وزن خالی', value: this.draft.weight.empty },
        ];
        this.paymentData = [
            [
                { title: 'هزینه حمل', value: this.draft.payment?.price },
                { title: 'مبلغ حمل', value: this.draft.payment?.value },
            ],
            [
                { title: 'رسید پرداخت', value: this.draft.payment?.checkout?.code, english: true },
                {
                    title: 'وضعیت پرداخت',
                    value: this.draft.payment?.checkout?.status === 'PAID' ? 'پرداخت شده' : 'پرداخت نشده',
                },
            ],
        ];
    }

    fileDownload(id: string): void {
        const attachment = this.draft.attachments.find((a) => a.id === id);
        if (!attachment) return;

        this.loadToolsService.downloadFile(attachment.file.path, `${this.draft.code} ${attachment.title}`);
    }

    getStep(step: string): string {
        return LoadCargoInfo[this.draft.cargo.type].steps.find((s) => s.id === step)?.title || '';
    }

    loadLogs(): void {
        this.logLoading = true;
        const ID: string = this.draft.id;
        this.apiService.request<ILoadDraftLogRs>(
            'LoadDraftLog',
            { ids: { ID }, silent: true, loading: false },
            (response) => {
                this.logLoading = false;
                this.logs = response;
            },
        );
    }
}
