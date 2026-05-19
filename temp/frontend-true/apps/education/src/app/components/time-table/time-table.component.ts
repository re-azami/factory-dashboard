import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService } from '@webilix/ngx-helper';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { IEducationStudyDateDTO, IOptionDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { EducationDateInfo } from '@lib/shared';

import { TimeTableCreateComponent } from './create/time-table-create.component';
import { TimeTableUpdateComponent } from './update/time-table-update.component';

@Component({
    selector: 'education-time-table',
    imports: [NgxHelperPipeModule, MaterialModule],
    templateUrl: './time-table.component.html',
    styleUrl: './time-table.component.scss'
})
export class TimeTableComponent implements OnChanges {
    @Input({ required: true }) locations!: IOptionDTO[];
    @Input({ required: true }) dates!: IEducationStudyDateDTO[];

    public educationDateInfo = EducationDateInfo;

    public duration: number = 0;
    public theoretical: number = 0;
    public practical: number = 0;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.setDuration();
    }

    setDuration() {
        const jalali = JalaliDateTime();
        const sort = this.dates.sort((d1, d2) => {
            const date1: string = jalali.toString(d1.date).substring(0, 10) + ` ${d1.start} ${d1.end}`;
            const date2: string = jalali.toString(d2.date).substring(0, 10) + ` ${d2.start} ${d2.end}`;
            return date1.localeCompare(date2);
        });
        this.dates.splice(0, this.dates.length, ...sort);

        this.duration = this.dates.reduce((sum: number, d) => sum + d.duration, 0);
        this.theoretical = this.dates
            .filter((d) => d.type === 'THEORETICAL')
            .reduce((sum: number, d) => sum + d.duration, 0);
        this.practical = this.duration - this.theoretical;
    }

    create(): void {
        this.ngxHelperBottomSheetService.open<IEducationStudyDateDTO>(
            TimeTableCreateComponent,
            'ثبت تاریخ برگزاری',
            { data: { locations: this.locations, dates: [...this.dates] } },
            (response) => {
                this.dates.push(response);
                this.setDuration();
            },
        );
    }

    update(index: number) {
        if (!this.dates[index]) return;

        const dates = [...this.dates];
        dates.splice(index, 1);

        this.ngxHelperBottomSheetService.open<IEducationStudyDateDTO>(
            TimeTableUpdateComponent,
            'ویرایش تاریخ برگزاری',
            { data: { locations: this.locations, dates, date: this.dates[index] } },
            (response) => {
                this.dates[index] = response;
                this.setDuration();
            },
        );
    }

    delete(index: number) {
        if (!this.dates[index]) return;

        const jalali = JalaliDateTime();
        const date = this.dates[index];
        const title: string = `${jalali.toTitle(date.date)} (${date.end} - ${date.start})`;
        this.ngxHelperConfirmService.delete('تاریخ برگزاری', { title }, () => {
            this.dates.splice(index, 1);
            this.setDuration();
        });
    }
}
