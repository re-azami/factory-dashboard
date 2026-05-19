import { Component } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { ApiService, IKitchenServingCalendarRs, IKitchenServingDTO, IKitchenServingInfoRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { KitchenMeal, KitchenMealInfo, KitchenMealList } from '@lib/shared';

import { KitchenServingService } from '../../providers';

import { ServingCreateComponent } from '../../components/serving/create/serving-create.component';
import { ServingInfoComponent } from '../../components/serving/info/serving-info.component';

interface IDay {
    date: Date;
    meals: { [key in KitchenMeal]: IKitchenServingDTO | null };
}

@Component({
    host: { selector: 'calendar' },
    standalone: false,
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
    public kitchenMealList = KitchenMealList;
    public kitchenMealInfo = KitchenMealInfo;

    public title: IPageTitle = {
        title: 'برنامه غذایی هفتگی',
        toolbar: { route: ['/calendar'], calendar: { types: ['WEEK'] } },
    };

    public calendarAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_CALENDAR' });
    public servingAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_SERVING' });

    public loading: boolean = false;
    public days: IDay[] = [];

    private from!: Date;
    private to!: Date;
    private jalali = JalaliDateTime();

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly kitchenServingService: KitchenServingService,
    ) {}

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadCalendar();
    }

    loadCalendar(): void {
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<IKitchenServingCalendarRs>(
            'KitchenServingCalendar',
            { params: { from, to } },
            (response) => {
                this.loading = false;

                const getString = (date: Date): string => this.jalali.toString(date, { format: 'Y-M-D' });
                const findMeal = (jalali: string, meal: KitchenMeal): IKitchenServingDTO | null =>
                    response.find((serving) => getString(serving.date) === jalali && serving.meal === meal) || null;

                this.days = [];
                for (var d = 0; d < 7; d++) {
                    const date: Date = this.jalali.periodDay(1, new Date(this.from.getTime() + d * 24 * 3600 * 1000)).from;
                    const jalali = getString(date);

                    this.days.push({
                        date,
                        meals: {
                            BREAKFAST: findMeal(jalali, 'BREAKFAST'),
                            LUNCH: findMeal(jalali, 'LUNCH'),
                            DINNER: findMeal(jalali, 'DINNER'),
                        },
                    });
                }
            },
        );
    }

    getMenu(serving: IKitchenServingDTO): NgxHelperMenu[] {
        return [
            { title: 'پرینت بارکد', icon: 'qr_code', click: () => this.print(serving) },
            { title: 'مشاهده مشخصات', icon: 'dining', click: () => this.info(serving) },
            'DIVIDER',
            {
                title: 'اطلاعات سرو',
                icon: 'soup_kitchen',
                click: ['/calendar', serving.id],
                hideOn: () => !this.servingAccess,
            },
            {
                title: 'ویرایش',
                icon: 'edit',
                click: () => this.update(serving),
                hideOn: () => serving.isServed || !this.calendarAccess,
            },
            {
                title: 'حذف',
                icon: 'delete',
                color: 'warn',
                click: () => this.delete(serving),
                hideOn: () => serving.isServed || !this.calendarAccess,
            },
        ];
    }

    create(date: Date, meal: KitchenMeal): void {
        this.ngxHelperBottomSheetService.open(ServingCreateComponent, 'ثبت برنامه غذایی', { data: { date, meal } }, () =>
            this.loadCalendar(),
        );
    }

    print(serving: IKitchenServingDTO): void {
        this.kitchenServingService.download(serving.id);
    }

    info(serving: IKitchenServingDTO): void {
        const ID: string = serving.id;
        this.apiService.request<IKitchenServingInfoRs>('KitchenServingInfo', { ids: { ID } }, (response) => {
            this.ngxHelperBottomSheetService.open(ServingInfoComponent, 'مشخصات برنامه غذایی', {
                data: { serving: response },
                padding: '0',
            });
        });
    }

    update(serving: IKitchenServingDTO): void {
        this.kitchenServingService.update(serving, () => this.loadCalendar());
    }

    delete(serving: IKitchenServingDTO): void {
        this.kitchenServingService.delete(serving, () => this.loadCalendar());
    }
}
