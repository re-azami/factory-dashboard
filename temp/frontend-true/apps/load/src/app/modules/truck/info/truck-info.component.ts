import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ApiService, ILoadTruckDraftRs, ILoadTruckDTO, ILoadTruckStatusRq, ILoadTruckStatusRs, IOptionDTO } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../../providers';
import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

@Component({
    host: { selector: 'truck-info' },
    templateUrl: './truck-info.component.html',
    styleUrl: './truck-info.component.scss',
    standalone: false
})
export class TruckInfoComponent implements OnInit {
    public truck: ILoadTruckDTO = this.activatedRoute.snapshot.data['truck'];
    public owners: IOptionDTO[] = this.activatedRoute.snapshot.data['owners'];
    public action: string = this.activatedRoute.snapshot.data['action'];

    public title: IPageTitle = { title: 'مدیریت ناوگان', description: this.loadToolsService.getPlate(this.truck.plate) };

    public truckData: IPageBlock[] = [];
    public otherValues: INgxHelperValue[] = [];
    public driverValues: INgxHelperValue[] = [];

    public draftLoading: boolean = true;
    public draftReport!: ILoadTruckDraftRs;
    public draftData: IPageBlock[] = [
        { title: 'تعداد حواله‌ها', value: '...' },
        { title: '‌وزن حواله‌ها', value: '...' },
    ];

    public activeTab: number = this.action === 'update' ? 1 : 0;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.setTruck(this.truck, true);

        const ID: string = this.truck.id;
        this.apiService.request<ILoadTruckDraftRs>('LoadTruckDraft', { ids: { ID } }, (response) => {
            this.draftLoading = false;
            this.draftReport = response;

            this.draftData = [
                { title: 'تعداد حواله‌ها', value: response.draft.count },
                { title: 'وزن حواله‌ها', value: response.draft.weight },
            ];
        });
    }

    setTruck(truck: ILoadTruckDTO, ignoreTab?: boolean): void {
        this.truck = truck;
        this.title = {
            ...this.title,
            description: this.loadToolsService.getPlate(this.truck.plate),
            actions: [
                {
                    icon: this.truck.status === 'ACTIVE' ? 'disabled_by_default' : 'check_box',
                    title: this.truck.status === 'ACTIVE' ? 'غیرفعال کردن' : 'فعال کردن',
                    action: () => this.status(this.truck.status === 'ACTIVE' ? false : true),
                    color: this.truck.status === 'ACTIVE' ? 'warn' : 'primary',
                },
                {
                    icon: 'published_with_changes',
                    title: 'گزارش تغییرات',
                    action: () => this.loadToolsService.logData('TRUCK', this.truck.id),
                    access: { access: 'LOAD_DATA_LOG' },
                },
                { type: 'RETURN', action: ['/truck'] },
            ],
        };

        this.setBlocks();
        this.setValues();

        if (!ignoreTab) this.activeTab = 0;
    }

    setBlocks(): void {
        this.truckData = [
            { title: 'نوع ناوگان', value: this.truck.type },
            { title: 'شماره شاسی', value: this.truck.vin, english: true },
        ];
    }

    setValues(): void {
        this.otherValues = [
            { title: 'تاریخ ثبت', value: { type: 'DATE', value: this.truck.create } },
            { title: 'مالک', value: this.truck.owner.name },
            { title: 'توزین', value: { type: 'NUMBER', value: this.truck.weight?.weight || 0 } },
        ];
        this.driverValues = [
            { title: 'راننده', value: `${this.truck.driver.name.first} ${this.truck.driver.name.last}` },
            { title: 'موبایل', value: { type: 'MOBILE', value: this.truck.driver.mobile || '', english: true }, copy: true },
            {
                title: 'کدملی',
                value: { type: 'ENGLISH', value: this.truck.driver.nationalCode || '' },
                copy: true,
            },
        ];
    }

    status(active: boolean): void {
        const item: string = 'ناوگان';
        const message: string = active
            ? 'پس از فعال کردن ناوگان، امکان ثبت حواله جدید برای ناوگان وجود دارد.'
            : 'در صورت تایید، اطلاعات ناوگان در سیستم باقی خواهد ماند و در گزارش‌های اطلاعات سیستم نمایش داده می‌شود اما امکان ثبت حواله جدید برای ناوگان وجود ندارد. ' +
              'در صورتی که حواله‌ فعالی در سیستم برای ناوگان وجود داشته باشد، امکان ادامه فرایند برای حواله مورد نظر وجود دارد.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { message }, () => {
            const ID: string = this.truck.id;
            const body: ILoadTruckStatusRq = { active };
            this.apiService.request<ILoadTruckStatusRs>('LoadTruckStatus', { body, ids: { ID } }, (response) => {
                this.setTruck({ ...this.truck, status: this.truck.status === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE' }, true);
                this.ngxHelperToastService.success(`ناوگان با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }
}
