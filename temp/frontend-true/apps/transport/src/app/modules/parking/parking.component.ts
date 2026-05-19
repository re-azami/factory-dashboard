import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperCoordinatesService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    ITransportParkingDTO,
    ITransportParkingDeleteRs,
    ITransportParkingListRs,
    ITransportParkingMapRs,
    ITransportParkingStatusRq,
    ITransportParkingStatusRs,
    ITransportParkingVehicleDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { TransportVehicle, TransportVehicleInfo, TransportVehicleList } from '@lib/shared';

import { IKmlCoordinates, TransportKmlService } from '../../providers';

import { ParkingCreateComponent } from './create/parking-create.component';
import { ParkingUpdateComponent } from './update/parking-update.component';

@Component({
    host: { selector: 'parking' },
    templateUrl: './parking.component.html',
    styleUrls: ['./parking.component.scss'],
    standalone: false
})
export class ParkingComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت پارکینگ‌ها',
        toolbar: { route: ['/parking'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [
            { title: 'مشاهده نقشه', icon: 'map', action: ['/parking', 'map'] },
            { title: 'لیست ناوگان', icon: 'commute', action: ['/parking', 'vehicles'] },
            { title: 'دانلود لیست', icon: 'download', action: this.download.bind(this) },
            { type: 'CREATE', title: 'ثبت پارکینگ', action: this.create.bind(this) },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public parkings: ITransportParkingDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ITransportParkingDTO> = {
        type: 'پارکینگ',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/parking', data.id, 'vehicle'] },
            { title: 'ناوگان', value: (data) => data.vehicles.length, type: 'NUMBER' },
            { title: 'عرض جغرافیایی', value: (data) => data.latitude.toString(), english: true },
            { title: 'طول جغرافیایی', value: (data) => data.longitude.toString(), english: true },
            ...TransportVehicleList.map((vehicle: TransportVehicle) => ({
                title: TransportVehicleInfo[vehicle].title,
                value: (data: ITransportParkingDTO) => data.vehicles.filter((v) => v.type === vehicle).length,
                type: 'NUMBER' as 'NUMBER',
            })),
        ],
        actions: [
            {
                title: 'مدیریت ناوگان',
                icon: 'commute',
                action: (data: ITransportParkingDTO) => ['/parking', data.id, 'vehicle'],
            },
            { title: 'مشاهده نقشه', icon: 'map', action: this.map.bind(this) },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperCoordinatesService: NgxHelperCoordinatesService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportKmlService: TransportKmlService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ITransportParkingListRs>('TransportParkingList', { params: { query, page } }, (response) => {
            this.parkings = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open<ITransportParkingDTO>(
            ParkingCreateComponent,
            'ثبت پارکینگ جدید',
            (parking) => {
                this.router.navigate(['/parking', parking.id, 'vehicle']);
                this.ngxHelperToastService.success('پارکینگ با موفقیت ثبت شد.');
            },
        );
    }

    map(parking: ITransportParkingDTO): void {
        this.ngxHelperCoordinatesService.show(
            { latitude: parking.latitude, longitude: parking.longitude },
            { image: 'assets/pin/coordinates.png' },
        );
    }

    status(parking: ITransportParkingDTO, active: boolean): void {
        const item: string = 'پارکینگ';
        const title: string = parking.title;
        const message: string = active
            ? 'پس از فعال کردن پارکینگ، امکان استفاده از پارکینگ در سرویس‌های حمل و نقل وجود دارد.'
            : 'در صورت تایید، اطلاعات پارکینگ در سیستم باقی خواهد ماند و در گزارش‌های اطلاعات سیستم نمایش داده می‌شود اما امکان استفاده از پارکینگ در سرویس‌های حمل و نقل وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = parking.id;
            const body: ITransportParkingStatusRq = { active };
            this.apiService.request<ITransportParkingStatusRs>('TransportParkingStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`پارکینگ با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(parking: ITransportParkingDTO): void {
        this.ngxHelperBottomSheetService.open(ParkingUpdateComponent, 'ویرایش پارکینگ', { data: { parking } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('پارکینگ با موفقیت ویرایش شد.');
        });
    }

    delete(parking: ITransportParkingDTO): void {
        const item: string = 'پارکینگ';
        const title: string = parking.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = parking.id;
            this.apiService.request<ITransportParkingDeleteRs>('TransportParkingDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('پارکینگ با موفقیت حذف شد.');
            });
        });
    }

    download(): void {
        if (this.parkings.length === 0) return;

        this.apiService.request<ITransportParkingMapRs>('TransportParkingMap', (response) => {
            if (response.length === 0) {
                this.ngxHelperToastService.error('پارکینگ ثبت نشده است.');
                return;
            }

            const coordinates: IKmlCoordinates[] = response.map((parking: ITransportParkingDTO) => ({
                title: parking.title,
                latitude: parking.latitude,
                longitude: parking.longitude,
                description: parking.vehicles.map((vehicle: ITransportParkingVehicleDTO) => vehicle.title),
            }));

            this.transportKmlService.download('لیست پارکینگ‌ها', coordinates);
        });
    }
}
