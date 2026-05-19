import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoTruckDeleteRs, ILoadCargoTruckListRs, ILoadTruckDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { CargoTruckCreateComponent } from './create/cargo-truck-create.component';

@Component({
    host: { selector: 'cargo-truck' },
    templateUrl: './cargo-truck.component.html',
    styleUrl: './cargo-truck.component.scss',
    standalone: false
})
export class CargoTruckComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public cargo: ILoadCargoDTO = this.activatedRoute.snapshot.data['cargo'];

    public title: IPageTitle = {
        title: 'مدیریت بارها',
        description: 'ناوگان اختصاصی',
        actions: [
            { type: 'CREATE', title: 'ثبت ناوگان اختصاصی', action: this.create.bind(this) },
            { type: 'RETURN', action: ['/cargo'] },
        ],
    };

    public blocks: IPageBlock[] = [
        { title: 'طرف حساب', value: this.cargo.party?.title || '' },
        { title: 'محموله', value: this.cargo.shipment?.title || '' },
    ];

    public loading: boolean = true;
    public trucks: ILoadTruckDTO[] = [];

    public list: IList<ILoadTruckDTO> = {
        type: 'ناوگان',
        isDeactive: (data) => data.status === 'DEACTIVE' || data.owner.status === 'DEACTIVE',
        columns: [
            { value: (data) => data.plate, type: 'PLATE' },
            { title: 'مالک', value: (data) => data.owner.name },
            { title: 'راننده', value: (data) => `${data.driver.name.first} ${data.driver.name.last}` },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
            { title: 'وضعیت مالک', value: (data) => (data.owner.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [{ type: 'DELETE', action: this.delete.bind(this) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(): void {
        const ID: string = this.cargo.id;
        this.apiService.request<ILoadCargoTruckListRs>('LoadCargoTruckList', { ids: { ID } }, (response) => {
            this.loading = false;
            this.trucks = response;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(
            CargoTruckCreateComponent,
            'ثبت ناوگان اختصاصی',
            { data: { cargo: this.cargo } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('ناوگان با موفقیت در لیست ناوگان اختصاصی بار ثبت شد.');
            },
        );
    }

    delete(truck: ILoadTruckDTO): void {
        const item: string = 'ناوگان';

        this.ngxHelperConfirmService.delete(item, () => {
            const ID: string = this.cargo.id;
            const TRUCKID: string = truck.id;
            this.apiService.request<ILoadCargoTruckDeleteRs>('LoadCargoTruckDelete', { ids: { ID, TRUCKID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('ناوگان با موفقیت از لیست ناوگان اختصاصی بار حذف شد.');
            });
        });
    }
}
