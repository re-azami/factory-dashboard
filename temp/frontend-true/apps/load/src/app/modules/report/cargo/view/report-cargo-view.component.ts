import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ILoadCargoDTO } from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { LoadStatusInfo } from '@lib/shared';

import { LoadToolsService } from '../../../../providers';

@Component({
    selector: 'report-cargo-view',
    templateUrl: './report-cargo-view.component.html',
    styleUrl: './report-cargo-view.component.scss',
    standalone: false
})
export class ReportCargoViewComponent implements OnChanges {
    @Input({ required: true }) cargo!: ILoadCargoDTO;
    @Input({ required: true }) draft!: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
    @Input({ required: true }) action!: 'REPORT' | 'CHART' | 'ATTACHMENT';

    public title: IPageTitle = {
        title: 'گزارش بار',
        actions: [
            {
                type: 'MENU',
                title: 'گزارش‌ها',
                icon: 'arrow_drop_down',
                action: (id: string) =>
                    ['/report', 'cargo', this.cargo.id, id === 'REPORT' ? '' : id.toLowerCase()].filter((r) => !!r),
                menu: [
                    { id: 'REPORT', title: 'گزارش حواله‌ها', deactiveOn: () => this.action === 'REPORT' },
                    { id: 'CHART', title: 'نمودار ماهانه حواله‌ها', deactiveOn: () => this.action === 'CHART' },
                    'DIVIDER',
                    { id: 'ATTACHMENT', title: 'فایل‌های ضمیمه', deactiveOn: () => this.action === 'ATTACHMENT' },
                ],
            },
            { title: 'انتخاب بار', icon: 'terrain', action: ['/report', 'cargo'] },
        ],
    };

    public cargoBlock: IPageBlock[] = [];
    public draftBlock: IPageBlock[] = [];
    public datesBlock: IPageBlock[][] = [];

    public buttons: IPageCardButton[] = [];

    private jalali = JalaliDateTime();

    constructor(private readonly router: Router, private readonly loadToolsService: LoadToolsService) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.cargoBlock = [
            { title: 'وضعیت', value: LoadStatusInfo[this.cargo.status].title },
            { title: 'عیار', value: this.cargo.grade },
            { title: 'تناژ بار', value: this.cargo.tonnage },
        ];
        this.draftBlock = [
            { title: 'تعداد کل حواله‌ها', value: this.draft.count },
            { title: 'وزن حواله‌ها', value: this.draft.weight },
        ];

        if (this.cargo.letter)
            this.buttons.push({ icon: 'download', title: 'دانلود نامه ترخیص', action: this.letter.bind(this) });

        if (this.draft.count) {
            const format: string = 'W، d N Y H:I';
            this.datesBlock = [
                [{ title: 'اولین حواله', value: this.jalali.toFullText(this.draft.first, { format }) }],
                [{ title: 'آخرین حواله', value: this.jalali.toFullText(this.draft.last, { format }) }],
            ];
        }
    }

    letter(): void {
        if (!this.cargo.letter) return;
        this.loadToolsService.downloadFile(this.cargo.letter.path, this.cargo.title);
    }
}
