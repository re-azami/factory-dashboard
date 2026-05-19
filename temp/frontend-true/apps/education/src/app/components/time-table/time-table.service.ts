import { Injectable } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { IEducationStudyDateDTO, IOptionDTO } from '@lib/apis';

@Injectable()
export class TimeTableService {
    get hours(): IOptionDTO[] {
        return [...Array(27).keys()].map((index: number) => ({
            id: (Math.trunc(index / 2) + 7).toString().padStart(2, '0') + (index % 2 === 0 ? ':00' : ':30'),
            title: (Math.trunc(index / 2) + 7).toString().padStart(2, '0') + (index % 2 === 0 ? ':00' : ':30'),
        }));
    }

    getMinutes(time: string): number {
        const [h, m] = time.split(':');
        return +h * 60 + +m;
    }

    check(date: Date, start: string, end: string, dates: IEducationStudyDateDTO[]): string | null {
        const jalali = JalaliDateTime();
        const getHours = (start: string, end: string): string[] => {
            let sMinute: number = this.getMinutes(start);
            const eMinute: number = this.getMinutes(end);
            const getHour = (minute: number): string => {
                const h: number = Math.trunc(minute / 60);
                minute -= h * 60;

                return h.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
            };

            const hours: string[] = [];
            while (sMinute < eMinute) {
                hours.push(getHour(sMinute));
                sMinute += 30;
            }
            return hours;
        };

        if (start >= end) return 'ساعت شروع باید قبل از ساعت پایان مشحص شده باشد.';

        const hours: string[] = getHours(start, end);
        for (let d = 0; d < dates.length; d++) {
            const check: IEducationStudyDateDTO = dates[d];
            if (jalali.toDate(check.date) !== jalali.toDate(date)) continue;

            const error: string =
                'زمان انتخاب شده با زمان ' +
                `"${jalali.toTitle(check.date)} (${check.end} - ${check.start})"` +
                ' تداخل دارد.';
            const hCheck: string[] = getHours(check.start, check.end);
            for (let h = 0; h < hCheck.length; h++) if (hours.includes(hCheck[h])) return error;
        }

        return null;
    }
}
