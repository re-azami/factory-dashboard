import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';

import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperCoordinatesService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationDeleteRs,
    ITransportLocationListRs,
    ITransportLocationStatusRq,
    ITransportLocationStatusRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LocationCreateComponent } from './create/location-create.component';
import { LocationUpdateComponent } from './update/location-update.component';

@Component({
    host: { selector: 'location' },
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss'],
    standalone: false
})
export class LocationComponent implements OnInit {
    public group: ITransportGroupDTO = this.activatedRoute.snapshot.data['group'];

    public page: number = 1;
    public title!: IPageTitle;

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public locations: ITransportLocationDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ITransportLocationDTO> = {
        type: 'گروه',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/location', this.group.id, data.id, 'passenger'] },
            { title: 'مسافر', value: (data) => data.passengers.length, type: 'NUMBER' },
            { title: 'عرض جغرافیایی', value: (data) => data.latitude.toString(), english: true },
            { title: 'طول جغرافیایی', value: (data) => data.longitude.toString(), english: true },
        ],
        actions: [
            {
                icon: 'people',
                title: 'مدیریت مسافرها',
                action: (data: ITransportLocationDTO) => ['/location', this.group.id, data.id, 'passenger'],
            },
            { icon: 'map', title: 'مشاهده نقشه', action: this.map.bind(this) },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    public menu: NgxHelperListMenu<ITransportLocationDTO>[] = ['DIVIDER'];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperCoordinatesService: NgxHelperCoordinatesService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe({
            next: (data: Data) => {
                this.group = data['group'];
                this.setTitle();
                this.loadList();
            },
        });
    }

    setTitle(): void {
        this.page = 1;
        this.title = {
            title: 'مدیریت مکان‌ها',
            toolbar: {
                route: ['/location', this.group.id],
                params: [{ name: 'query', type: 'SEARCH' }],
            },
            actions: [{ type: 'CREATE', title: 'ثبت مکان', action: this.create.bind(this) }],
        };
    }

    loadList(value?: INgxHelperParamValue): void {
        if (!this.params && !value) return;
        this.params = value || this.params;

        const group: string = this.group.id;
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ITransportLocationListRs>(
            'TransportLocationList',
            { params: { group, query, page } },
            (response) => {
                this.locations = response.list;
                this.pagination = response.pagination;
                this.loading = false;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open<ITransportLocationDTO>(
            LocationCreateComponent,
            'ثبت مکان جدید',
            { data: { group: this.group } },
            (location) => {
                this.router.navigate(['/location', this.group.id, location.id, 'passenger']);
                this.ngxHelperToastService.success('مکان با موفقیت ثبت شد.');
            },
        );
    }

    map(location: ITransportLocationDTO): void {
        this.ngxHelperCoordinatesService.show(
            { latitude: location.latitude, longitude: location.longitude },
            { image: 'assets/pin/coordinates.png' },
        );
    }

    status(location: ITransportLocationDTO, active: boolean): void {
        const item: string = 'مکان';
        const title: string = location.title;
        const message: string = active
            ? 'پس از فعال کردن مکان، امکان استفاده از مکان در سرویس‌های حمل و نقل وجود دارد.'
            : 'در صورت تایید، اطلاعات مکان در سیستم باقی خواهد ماند و در گزارش‌های اطلاعات سیستم نمایش داده می‌شود اما امکان استفاده از مکان در سرویس‌های حمل و نقل وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const group: string = this.group.id;
            const ID: string = location.id;
            const body: ITransportLocationStatusRq = { active };
            this.apiService.request<ITransportLocationStatusRs>(
                'TransportLocationStatus',
                { body, ids: { ID }, params: { group } },
                () => {
                    this.loadList();
                    this.ngxHelperToastService.success(`مکان با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
                },
            );
        });
    }

    update(location: ITransportLocationDTO): void {
        this.ngxHelperBottomSheetService.open(
            LocationUpdateComponent,
            'ویرایش مکان',
            { data: { group: this.group, location } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('مکان با موفقیت ویرایش شد.');
            },
        );
    }

    delete(location: ITransportLocationDTO): void {
        const item: string = 'مکان';
        const title: string = location.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const group: string = this.group.id;
            const ID: string = location.id;
            this.apiService.request<ITransportLocationDeleteRs>(
                'TransportLocationDelete',
                { ids: { ID }, params: { group } },
                () => {
                    this.loadList();
                    this.ngxHelperToastService.success('مکان با موفقیت حذف شد.');
                },
            );
        });
    }
}
