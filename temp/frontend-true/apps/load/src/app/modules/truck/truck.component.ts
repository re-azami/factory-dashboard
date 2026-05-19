import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadTruckDeleteRs,
    ILoadTruckDTO,
    ILoadTruckListRs,
    ILoadTruckStatusRq,
    ILoadTruckStatusRs,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

import { TruckCreateComponent } from './create/truck-create.component';
import { TruckCargoComponent } from './cargo/truck-cargo.component';

@Component({
    host: { selector: 'truck' },
    templateUrl: './truck.component.html',
    styleUrl: './truck.component.scss',
    standalone: false
})
export class TruckComponent {
    public owners: IOptionDTO[] = this.activatedRoute.snapshot.data['owners'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت ناوگان',
        toolbar: {
            route: ['/truck'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: [
                        { title: 'فعال', value: 'ACTIVE', icon: 'check_circle' },
                        { title: 'غیرفعال', value: 'DEACTIVE', icon: 'cancel' },
                    ],
                },
                { name: 'owner', type: 'SELECT', title: 'مالک', options: this.owners },
            ],
        },
        actions: [
            { title: 'جستجوی پلاک', icon: 'search', action: this.search.bind(this) },
            { type: 'CREATE', title: 'ناوگان جدید', action: this.create.bind(this) },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public trucks: ILoadTruckDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadTruckDTO> = {
        type: 'ناوگان',
        isDeactive: (data) => data.status === 'DEACTIVE' || data.owner.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' && data.owner.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' && data.owner.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { value: (data) => data.plate, type: 'PLATE', action: (data) => ['/truck', 'info', data.id] },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'مالک', value: (data) => data.owner.name },
            { title: 'راننده', value: (data) => `${data.driver.name.first} ${data.driver.name.last}` },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
            { title: 'وضعیت مالک', value: (data) => (data.owner.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { title: 'بارهای مرتبط', icon: 'terrain', action: this.truck.bind(this) },
            {
                title: 'فایل‌های ضمیمه',
                icon: 'attach_file',
                action: (data: ILoadTruckDTO) => ['/truck', 'attachment', data.id],
            },
            'DIVIDER',
            { type: 'UPDATE', action: (data) => ['/truck', 'update', data.id] },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadTruckDTO) => ['/report', 'truck', data.id],
                access: { access: 'LOAD_REPORT_TRUCK' },
            },
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LOAD_DATA_LOG' } },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const owner: string = this.params?.params?.['owner']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadTruckListRs>('LoadTruckList', { params: { status, owner, page } }, (response) => {
            this.loading = false;
            this.trucks = response.list;
            this.pagination = response.pagination;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(
            TruckCreateComponent,
            'ثبت ناوگان جدید',
            { data: { owners: this.owners } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('ناوگان با موفقیت ثبت شد.');
            },
        );
    }

    delete(truck: ILoadTruckDTO): void {
        const item: string = 'ناوگان';
        const message: string =
            'در صورت تایید، اطلاعات حواله‌های مربوط به ناوگان در سیستم باقی خواهد ماند اما مشخصات ناوگان حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = truck.id;
            this.apiService.request<ILoadTruckDeleteRs>('LoadTruckDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('ناوگان با موفقیت حذف شد.');
            });
        });
    }

    status(truck: ILoadTruckDTO, active: boolean): void {
        const item: string = 'ناوگان';
        const message: string = active
            ? 'پس از فعال کردن ناوگان، امکان ثبت حواله جدید برای ناوگان وجود دارد.'
            : 'در صورت تایید، اطلاعات ناوگان در سیستم باقی خواهد ماند و در گزارش‌های اطلاعات سیستم نمایش داده می‌شود اما امکان ثبت حواله جدید برای ناوگان وجود ندارد. ' +
              'در صورتی که حواله‌ فعالی در سیستم برای ناوگان وجود داشته باشد، امکان ادامه فرایند برای حواله مورد نظر وجود دارد.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { message }, () => {
            const ID: string = truck.id;
            const body: ILoadTruckStatusRq = { active };
            this.apiService.request<ILoadTruckStatusRs>('LoadTruckStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`ناوگان با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(truck: ILoadTruckDTO): void {
        this.loadToolsService.logData('TRUCK', truck.id);
    }

    truck(truck: ILoadTruckDTO): void {
        this.ngxHelperBottomSheetService.open(TruckCargoComponent, 'بارهای مرتبط با ناوگان', { data: { truck } });
    }

    search(): void {
        this.loadToolsService.selectTruck((truck) => this.router.navigate(['/truck', 'info', truck.id]));
    }
}
