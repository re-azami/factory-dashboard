import { Component, OnInit } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, IEducationStudyDTO, IEducationStudyDateDTO, IEducationStudyListRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';

interface ICalendar {
    readonly jalali: string;
    readonly date: Date;
    locations: {
        readonly id: string;
        readonly title: string;
        periods: { course: string; start: string; end: string }[];
    }[];
}

@Component({
    host: { selector: 'study-calendar' },
    templateUrl: './study-calendar.component.html',
    styleUrl: './study-calendar.component.scss',
    standalone: false
})
export class StudyCalendarComponent implements OnInit {
    public title: IPageTitle = { title: 'تقویم فضای آموزشی' };

    public loading: boolean = true;
    public calendar: ICalendar[] = [];

    private jalali = JalaliDateTime();

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.request<IEducationStudyListRs>('EducationStudyList', (response) => {
            this.loading = false;

            const today: string = this.jalali.toDate(new Date());
            response.forEach((study: IEducationStudyDTO) => {
                study.dates.forEach((date: IEducationStudyDateDTO) => {
                    const jalali: string = this.jalali.toDate(date.date);
                    if (!date.location || jalali < today) return;

                    const calendar = this.calendar.find((c) => c.jalali === jalali);
                    if (calendar) {
                        const location = calendar.locations.find((l) => l.id === date.location?.id);
                        if (location)
                            location.periods.push({ course: study.course.title, start: date.start, end: date.end });
                        else
                            calendar.locations.push({
                                id: date.location.id,
                                title: date.location.title,
                                periods: [{ course: study.course.title, start: date.start, end: date.end }],
                            });
                    } else
                        this.calendar.push({
                            jalali,
                            date: date.date,
                            locations: [
                                {
                                    id: date.location.id,
                                    title: date.location.title,
                                    periods: [{ course: study.course.title, start: date.start, end: date.end }],
                                },
                            ],
                        });
                });
            });

            this.calendar = this.calendar.sort((c1, c2) => c1.jalali.localeCompare(c2.jalali));
            this.calendar.forEach((c) => {
                c.locations = c.locations.sort((l1, l2) => l1.title.localeCompare(l2.title));
                c.locations.forEach((l) => (l.periods = l.periods.sort((p1, p2) => p1.start.localeCompare(p2.start))));
            });
        });
    }
}
