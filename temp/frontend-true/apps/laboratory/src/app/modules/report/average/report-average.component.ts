import { ChangeDetectorRef, Component } from '@angular/core';

import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { IPageTitle } from '@lib/page';
import { LaboratoryResultInfo, LaboratoryResultList } from '@lib/shared';

@Component({
    host: { selector: 'report-average' },
    templateUrl: './report-average.component.html',
    styleUrl: './report-average.component.scss',
    standalone: false
})
export class ReportAverageComponent {
    public laboratoryResultList = LaboratoryResultList;
    public laboratoryResultInfo = LaboratoryResultInfo;

    public title: IPageTitle = {
        title: 'گزارش متوسط نتایج آزمایش',
        toolbar: {
            route: ['/report', 'average'],
            calendar: { types: ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
        },
    };

    public activeTab: number = 0;
    public from?: Date;
    public to?: Date;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    setDate(values: INgxHelperCalendarValue) {
        this.from = values.period.from;
        this.to = values.period.to;
        this.changeDetectorRef.detectChanges();
    }
}
