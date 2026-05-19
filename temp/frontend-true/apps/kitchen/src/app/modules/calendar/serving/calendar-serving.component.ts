import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { JalaliDateTime, JalaliDateTimePeriod } from '@webilix/jalali-date-time';

import {
    ApiService,
    IKitchenGoodDTO,
    IKitchenLogDTO,
    IKitchenServingDTO,
    IKitchenServingGoodDeleteRs,
    IKitchenServingGoodDTO,
    IKitchenServingLogRs,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { DeviceService, IDeviceSize, UserService } from '@lib/providers';
import { KitchenGood, KitchenGoodInfo, KitchenGoodList, KitchenLogInfo, KitchenMealInfo } from '@lib/shared';

import { KitchenServingService, KitchenToolsService, KitchenUnitService } from '../../../providers';

import { ServingGoodCreateComponent } from '../../../components/serving/good/create/serving-good-create.component';
import { ServingDoneComponent } from '../../../components/serving/done/serving-done.component';
import { ServingServeComponent } from '../../../components/serving/serve/serving-serve.component';
import { ServingUsageComponent } from '../../../components/serving/usage/serving-usage.component';

interface IGood {
    good: IKitchenServingGoodDTO;
    serving: string | null;
    usage: string | null;
}

@Component({
    host: { selector: 'calendar-serving' },
    standalone: false,
    templateUrl: './calendar-serving.component.html',
    styleUrl: './calendar-serving.component.scss',
})
export class CalendarServingComponent implements OnInit, OnDestroy {
    public serving: IKitchenServingDTO = this.activatedRoute.snapshot.data['serving'];

    public kitchenGoodList = KitchenGoodList;
    public kitchenGoodInfo = KitchenGoodInfo;
    public kitchenLogInfo = KitchenLogInfo;

    public title!: IPageTitle;

    public usageCompelete: boolean = false;
    public buttons: IPageCardButton[] = [];
    public data: IPageBlock[] = [];
    public goods!: { [key in KitchenGood]: IGood[] };

    public logs: IKitchenLogDTO[] = [];

    public deviceSize!: IDeviceSize;
    private onSizeChanged?: Subscription;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService,
        private readonly kitchenServingService: KitchenServingService,
        private readonly kitchenToolsService: KitchenToolsService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngOnInit(): void {
        this.deviceSize = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe({
            next: (size: IDeviceSize) => (this.deviceSize = size),
        });

        this.activatedRoute.data.subscribe((data: Data) => {
            if (data['serving']) this.serving = data['serving'];
            this.setData();
        });
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
    }

    setData(): void {
        this.title = {
            title: 'برنامه غذایی هفتگی',
            description: 'ثبت اطلاعات سرو',
            actions: [
                { type: 'ACTION', title: 'میزان مصرف', icon: 'scale', action: () => this.usage() },
                {
                    type: 'ACTION',
                    title: 'پرینت بارکد',
                    icon: 'qr_code',
                    action: () => this.kitchenServingService.download(this.serving.id),
                },
                { type: 'ACTION', title: 'بازگشت', icon: 'chevron_right', action: () => this.return() },
            ],
        };

        this.usageCompelete = !this.serving.goods.some((good) => !good.usage);

        this.buttons =
            this.userService.hasAccess({ access: 'KITCHEN_CALENDAR' }) && !this.serving.isServed
                ? [
                      { icon: 'edit', title: 'ویرایش', action: this.update.bind(this) },
                      { icon: 'delete', title: 'حذف', action: this.delete.bind(this), color: 'warn' },
                  ]
                : [{ icon: 'soup_kitchen', title: 'تغییر تعداد سرو', action: this.serve.bind(this) }];

        this.data = [
            { title: 'وعده غذایی', value: KitchenMealInfo[this.serving.meal].title },
            { title: 'غذا', value: this.serving.recipe.title },
            { title: 'تعداد سرو', value: this.serving.serving },
            {
                title: 'وضعیت سرو',
                value: this.serving.isServed ? 'سرو شده' : 'ثبت نشده',
                color: this.serving.isServed ? undefined : 'warn',
            },
        ];

        const getGoods = (good: KitchenGood): IGood[] =>
            this.serving.goods
                .filter((g) => g.good === good)
                .map((g) => ({
                    good: g,
                    serving: this.kitchenServingService.servingPipe(g, this.serving.serving),
                    usage: g.usage?.amount ? this.kitchenUnitService.valueTitle(g.unit, g.usage.amount) : '',
                }));

        this.goods = {
            INGREDIENT: getGoods('INGREDIENT'),
            ADDITIVE: getGoods('ADDITIVE'),
            CONSUMABLE: getGoods('CONSUMABLE'),
        };

        if (this.userService.hasAccess({ access: 'KITCHEN_SERVING_LOG' })) this.loadLogs();
    }

    loadLogs(): void {
        const ID: string = this.serving.id;
        this.apiService.request<IKitchenServingLogRs>(
            'KitchenServingLog',
            { ids: { ID }, silent: true, loading: false },
            (response) => (this.logs = response),
        );
    }

    return(): void {
        const jalali = JalaliDateTime();
        const period: JalaliDateTimePeriod = jalali.periodWeek(1, this.serving.date);
        const from: string = jalali.toString(period.from, { format: 'Y-M-D' });
        const to: string = jalali.toString(period.to, { format: 'Y-M-D' });

        this.router.navigate(['/calendar'], {
            queryParams: {
                'ngx-helper-calendar-type': 'WEEK',
                'ngx-helper-calendar-from': from,
                'ngx-helper-calendar-to': to,
            },
        });
    }

    usage(good?: KitchenGood): void {
        const goods: IKitchenServingGoodDTO[] = good ? this.serving.goods.filter((g) => g.good === good) : [];
        if (good && goods.length === 0) return;

        this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
            ServingUsageComponent,
            'ثبت میزان مصرف',
            { data: { serving: this.serving, goods } },
            (response) => {
                this.serving = response;
                this.setData();
            },
        );
    }

    done(): void {
        if (this.serving.isServed) return;

        this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
            ServingDoneComponent,
            'ثبت اطلاعات سرو',
            { data: { serving: this.serving } },
            (response) => {
                this.serving = response;
                this.setData();
            },
        );
    }

    update(): void {
        this.kitchenServingService.update(this.serving, (serving: IKitchenServingDTO) => {
            this.serving = serving;
            this.setData();
        });
    }

    delete(): void {
        this.kitchenServingService.delete(this.serving, () => this.router.navigate(['/calendar']));
    }

    serve(): void {
        this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
            ServingServeComponent,
            'تغییر تعداد سرو',
            { data: { serving: this.serving } },
            (response) => {
                this.serving = response;
                this.setData();
            },
        );
    }

    //#region GOOD
    goodButtons(good: KitchenGood): IPageCardButton[] {
        return [
            { title: 'اضافه کردن', icon: 'add_box', action: () => this.createGood(good) },
            { title: 'میزان مصرف', icon: 'scale', action: () => this.usage(good) },
        ];
    }

    createGood(good: KitchenGood): void {
        const ignore: string[] = this.serving.goods.map((good) => good.id);
        this.kitchenToolsService.selectGood(good, ignore).then((good: IKitchenGoodDTO) => {
            this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
                ServingGoodCreateComponent,
                `اضافه کردن ${KitchenGoodInfo[good.good].title}`,
                { data: { serving: this.serving, good } },
                (response) => {
                    this.serving = response;
                    this.setData();
                },
            );
        });
    }

    updateGood(good: IKitchenServingGoodDTO): void {
        this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
            ServingUsageComponent,
            'ثبت میزان مصرف',
            { data: { serving: this.serving, goods: [good] } },
            (response) => {
                this.serving = response;
                this.setData();
            },
        );
    }

    deleteGood(good: IKitchenServingGoodDTO): void {
        const item: string = KitchenGoodInfo[good.good].title;
        const title: string = good.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const SERVINGID: string = this.serving.id;
            const ID: string = good.id;
            this.apiService.request<IKitchenServingGoodDeleteRs>(
                'KitchenServingGoodDelete',
                { ids: { SERVINGID, ID } },
                (response) => {
                    this.serving = response;
                    this.setData();
                    this.ngxHelperToastService.success(`${KitchenGoodInfo[good.good].title} با موفقیت حذف شد.`);
                },
            );
        });
    }
    //#endregion
}
