import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IOptionDTO,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationPassengerDTO,
    ITransportLocationPassengerDeleteRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { TransportPassengerInfo } from '@lib/shared';

import { LocationPassengerCreateComponent } from './create/location-passenger-create.component';
import { LocationPassengerUpdateComponent } from './update/location-passenger-update.component';
import { LocationPassengerTransferComponent } from './transfer/location-passenger-transfer.component';

@Component({
    host: { selector: 'location-passenger' },
    templateUrl: './location-passenger.component.html',
    styleUrls: ['./location-passenger.component.scss'],
    standalone: false
})
export class LocationPassengerComponent {
    public transportPassengerInfo = TransportPassengerInfo;

    public group: ITransportGroupDTO = this.activatedRoute.snapshot.data['group'];
    public location: ITransportLocationDTO = this.activatedRoute.snapshot.data['location'];

    public title: IPageTitle = {
        title: 'مدیریت مسافرها',
        actions: [
            { type: 'CREATE', title: 'ثبت مسافر', action: this.create.bind(this) },
            { type: 'RETURN', action: ['/location', this.group.id] },
        ],
    };

    public list: IList<ITransportLocationPassengerDTO> = {
        type: 'مسافر',
        icon: (data) => TransportPassengerInfo[data.type].icon,
        columns: [
            { title: 'نوع مسافر', value: (data) => TransportPassengerInfo[data.type].title, isDescription: true },
            { title: 'نام و نام خانوادگی', value: (data) => data.name, isTitle: true },
            { title: 'کد پرسنلی', value: (data) => data.code, english: true },
        ],
        actions: [
            { title: 'انتقال مسافر', icon: 'location_on', action: this.transfer.bind(this) },
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
        this.ngxHelperBottomSheetService.open<ITransportLocationDTO>(
            LocationPassengerCreateComponent,
            'ثبت مسافر جدید',
            { data: { group: this.group, location: this.location } },
            (location) => {
                this.location = location;
                this.ngxHelperToastService.success('مسافر با موفقیت ثبت شد.');
            },
        );
    }

    transfer(passenger: ITransportLocationPassengerDTO): void {
        const locations: IOptionDTO[] = this.activatedRoute.snapshot.data['locations'];
        this.ngxHelperBottomSheetService.open<ITransportLocationDTO>(
            LocationPassengerTransferComponent,
            'انتقال مسافر',
            { data: { group: this.group, locations, location: this.location, passenger } },
            (location) => {
                this.location = location;
                this.ngxHelperToastService.success('مسافر با موفقیت به مکان جدید منتقل شد.');
            },
        );
    }

    update(passenger: ITransportLocationPassengerDTO): void {
        this.ngxHelperBottomSheetService.open<ITransportLocationDTO>(
            LocationPassengerUpdateComponent,
            'ویرایش مسافر',
            { data: { group: this.group, location: this.location, passenger } },
            (location) => {
                this.location = location;
                this.ngxHelperToastService.success('مسافر با موفقیت ویرایش شد.');
            },
        );
    }

    delete(passenger: ITransportLocationPassengerDTO): void {
        const item: string = 'مسافر';
        const title: string = passenger.name;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const group: string = this.group.id;
            const LOCATIONID: string = this.location.id;
            const ID: string = passenger.id;
            this.apiService.request<ITransportLocationPassengerDeleteRs>(
                'TransportLocationPassengerDelete',
                { ids: { LOCATIONID, ID }, params: { group } },
                (response) => {
                    this.location = response;
                    this.ngxHelperToastService.success('مسافر با موفقیت حذف شد.');
                },
            );
        });
    }
}
