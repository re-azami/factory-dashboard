import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { NgxHelperParam } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IOptionDTO,
    ITransportParkingDTO,
    ITransportParkingVehicleDTO,
    ITransportParkingVehicleDeleteRs,
} from '@lib/apis';
import { Helpers, TransportVehicleInfo } from '@lib/shared';

import { ParkingVehicleCreateComponent } from './create/parking-vehicle-create.component';
import { ParkingVehicleUpdateComponent } from './update/parking-vehicle-update.component';
import { ParkingVehicleTransferComponent } from './transfer/parking-vehicle-transfer.component';
import { IPageTitle } from '@lib/page';
import { IList } from '@lib/list';

@Component({
    host: { selector: 'parking-vehicle' },
    templateUrl: './parking-vehicle.component.html',
    styleUrls: ['./parking-vehicle.component.scss'],
    standalone: false
})
export class ParkingVehicleComponent {
    public parking: ITransportParkingDTO = this.activatedRoute.snapshot.data['parking'];

    public title: IPageTitle = {
        title: 'مدیریت ناوگان',
        description: this.parking.title,
        actions: [
            { type: 'CREATE', title: 'ثبت ناوگان', action: this.create.bind(this) },
            { type: 'RETURN', action: ['/parking'] },
        ],
    };

    public list: IList<ITransportParkingVehicleDTO> = {
        type: 'ناوگان',
        icon: (data) => TransportVehicleInfo[data.type].icon,
        columns: [
            { title: 'نوع ناوگان', value: (data) => TransportVehicleInfo[data.type].title, isDescription: true },
            { title: 'عنوان', value: (data) => data.title, isTitle: true },
            { title: 'ظرفیت', value: (data) => data.capacity, type: 'NUMBER' },
        ],
        actions: [
            { title: 'انتقال ناوگان', icon: 'location_on', action: this.transfer.bind(this) },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    create(): void {
        this.ngxHelperBottomSheetService.open<ITransportParkingDTO>(
            ParkingVehicleCreateComponent,
            'ثبت ناوگان جدید',
            { data: { parking: this.parking } },
            (parking) => {
                this.parking = parking;
                this.ngxHelperToastService.success('ناوگان با موفقیت ثبت شد.');
            },
        );
    }

    transfer(vehicle: ITransportParkingVehicleDTO): void {
        const parkings: IOptionDTO[] = this.activatedRoute.snapshot.data['parkings'];
        this.ngxHelperBottomSheetService.open<ITransportParkingDTO>(
            ParkingVehicleTransferComponent,
            'انتقال ناوگان',
            { data: { parkings, parking: this.parking, vehicle } },
            (parking) => {
                this.parking = parking;
                this.ngxHelperToastService.success('ناوگان با موفقیت به پارکینگ جدید منتقل شد.');
            },
        );
    }

    update(vehicle: ITransportParkingVehicleDTO): void {
        this.ngxHelperBottomSheetService.open<ITransportParkingDTO>(
            ParkingVehicleUpdateComponent,
            'ویرایش ناوگان',
            { data: { parking: this.parking, vehicle } },
            (parking) => {
                this.parking = parking;
                this.ngxHelperToastService.success('ناوگان با موفقیت ویرایش شد.');
            },
        );
    }

    delete(vehicle: ITransportParkingVehicleDTO): void {
        const item: string = 'ناوگان';
        const title: string = vehicle.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const PARKINGID: string = this.parking.id;
            const ID: string = vehicle.id;
            this.apiService.request<ITransportParkingVehicleDeleteRs>(
                'TransportParkingVehicleDelete',
                { ids: { PARKINGID, ID } },
                (response) => {
                    this.parking = response;
                    this.ngxHelperToastService.success('ناوگان با موفقیت حذف شد.');
                },
            );
        });
    }
}
