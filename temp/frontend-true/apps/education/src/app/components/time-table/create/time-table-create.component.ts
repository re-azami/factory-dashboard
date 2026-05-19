import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { IEducationStudyDateDTO, IOptionDTO } from '@lib/apis';
import { EducationDate, EducationDateInfo, EducationDateList } from '@lib/shared';

import { TimeTableService } from '../time-table.service';

@Component({
    host: { selector: 'time-table-create' },
    imports: [NgxFormModule],
    providers: [TimeTableService],
    templateUrl: './time-table-create.component.html',
    styleUrl: './time-table-create.component.scss',
})
export class TimeTableCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت تاریخ برگزاری',
        inputs: [
            { name: 'date', type: 'DATE' },
            [
                { name: 'start', type: 'SELECT', title: 'ساعت شروع', options: this.timeTableService.hours },
                { name: 'end', type: 'SELECT', title: 'ساعت پایان', options: this.timeTableService.hours },
            ],
            [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع برگزاری',
                    options: EducationDateList.map((date: EducationDate) => ({
                        id: date,
                        title: EducationDateInfo[date].title,
                    })),
                },
                { name: 'location', type: 'SELECT', title: 'محل برگزاری', options: this.data.locations },
            ],
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { locations: IOptionDTO[]; dates: IEducationStudyDateDTO[] },
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
