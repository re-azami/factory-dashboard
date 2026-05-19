import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    ITransportStationCenterDTO,
    ITransportStationDeleteRs,
    ITransportStationInfoRs,
    ITransportStationListDTO,
    ITransportStationListRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';

import { IKmlCoordinates, TransportKmlService, TransportToolsService } from '../../providers';

import { StationUpdateComponent } from './update/station-update.component';
import { StationCopyComponent } from './copy/station-copy.component';

@Component({
    host: { selector: 'station' },
    templateUrl: './station.component.html',
    styleUrls: ['./station.component.scss'],
    standalone: false
})
export class StationComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'ایستگاه‌ها',
        toolbar: { route: ['/station'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [
            { title: 'مقایسه', icon: 'compare', action: ['/station', 'compare'] },
            { type: 'CREATE', title: 'محاسبه', action: this.create.bind(this) },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public stations: ITransportStationListDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ITransportStationListDTO> = {
        type: 'ایستگاه',
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/station', 'map', data.id] },
            { title: 'ثبت', value: 'date', type: 'DATE' },
            { title: 'ایستگاه', value: (data) => data.count.center, type: 'NUMBER' },
            { title: 'مکان', value: (data) => data.count.location, type: 'NUMBER' },
            { title: 'مسافر', value: (data) => data.count.passenger, type: 'NUMBER' },
        ],
        actions: [
            {
                icon: 'route',
                title: 'محاسبه مسیر',
                action: (data: ITransportStationListDTO) => ['/route', 'create', data.id],
                hideOn: () => !this.userService.hasAccess({ access: 'TRANSPORT_ROLE_ROUTE' }),
            },
            {
                title: 'مشاهده نقشه',
                icon: 'people',
                action: (data: ITransportStationListDTO) => ['/station', 'map', data.id],
            },
            { title: 'دانلود KML', icon: 'download', action: this.download.bind(this) },
            'DIVIDER',
            { title: 'کپی', icon: 'file_copy', action: this.copy.bind(this) },
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        public readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportKmlService: TransportKmlService,
        private readonly userService: UserService,
        private readonly transportToolsService: TransportToolsService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ITransportStationListRs>('TransportStationList', { params: { query, page } }, (response) => {
            this.stations = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    create(): void {
        this.transportToolsService.selectGroup((group) => this.router.navigate(['/station', 'map', group.id, 'create']));
    }

    copy(station: ITransportStationListDTO): void {
        this.ngxHelperBottomSheetService.open(StationCopyComponent, 'کپی ایستگاه', { data: { station } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('ایستگاه با موفقیت کپی شد.');
        });
    }

    update(station: ITransportStationListDTO): void {
        this.ngxHelperBottomSheetService.open(StationUpdateComponent, 'ویرایش ایستگاه', { data: { station } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('ایستگاه با موفقیت ویرایش شد.');
        });
    }

    delete(station: ITransportStationListDTO): void {
        const item: string = 'ایستگاه';
        const title: string = station.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = station.id;
            this.apiService.request<ITransportStationDeleteRs>('TransportStationDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('ایستگاه با موفقیت حذف شد.');
            });
        });
    }

    download(station: ITransportStationListDTO): void {
        const ID: string = station.id;
        this.apiService.request<ITransportStationInfoRs>('TransportStationInfo', { ids: { ID } }, (response) => {
            const coordinates: IKmlCoordinates[] = response.centers.map(
                (center: ITransportStationCenterDTO, index: number) => ({
                    title: `ایستگاه ${index + 1}`,
                    latitude: center.latitude,
                    longitude: center.longitude,
                    description: [
                        `مکان: ${center.locations.length}\n`,
                        `مسافر: ${center.locations.reduce((sum: number, l) => sum + l.passengers.length, 0)}`,
                    ],
                }),
            );

            this.transportKmlService.download(station.title, coordinates);
        });
    }
}
