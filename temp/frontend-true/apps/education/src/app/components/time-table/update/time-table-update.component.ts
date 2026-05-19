import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { IEducationStudyDateDTO, IOptionDTO } from '@lib/apis';
import { EducationDate, EducationDateInfo, EducationDateList } from '@lib/shared';

import { TimeTableService } from '../time-table.service';

@Component({
    host: { selector: 'time-table-update' },
    imports: [NgxFormModule],
    providers: [TimeTableService],
    templateUrl: './time-table-update.component.html',
    styleUrl: './time-table-update.component.scss',
})
export class TimeTableUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش تاریخ برگزاری',
        inputs: [
            { name: 'date', type: 'DATE', value: this.data.date.date },
            [
                {
                    name: 'start',
                    type: 'SELECT',
                    title: 'ساعت شروع',
                    value: this.data.date.start,
                    options: this.timeTableService.hours,
                },
                {
                    name: 'end',
                    type: 'SELECT',
                    title: 'ساعت پایان',
                    value: this.data.date.end,
                    options: this.timeTableService.hours,
                },
            ],
            [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع برگزاری',
                    value: this.data.date.type,
                    options: EducationDateList.map((date: EducationDate) => ({
                        id: date,
                        title: EducationDateInfo[date].title,
                    })),
                },
                {
                    name: 'location',
                    type: 'SELECT',
                    title: 'محل برگزاری',
                    value: this.data.date.location.id,
                    options: this.data.locations,
                },
            ],
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { locations: IOptionDTO[]; dates: IEducationStudyDateDTO[]; date: IEducationStudyDateDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly timeTableService: TimeTableService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const start: number = this.timeTableService.getMinutes(values['start']);
        const end: number = this.timeTableService.getMinutes(values['end']);
        const error: string | null = this.timeTableService.check(
            values['date'],
            values['start'],
            values['end'],
            this.data.dates,
        );
        if (error !== null) return this.ngxHelperToastService.error(error);

        const date: IEducationStudyDateDTO = {
            date: values['date'],
            start: values['start'],
            end: values['end'],
            duration: (end - start) * 60,
            type: values['type'],
            location: this.data.locations.find((l) => l.id === values['location'])!,
        };
        this.ngxHelperBottomSheetService.close(date);
    }
}
