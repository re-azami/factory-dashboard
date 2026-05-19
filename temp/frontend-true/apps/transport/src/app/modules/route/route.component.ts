import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IOptionDTO,
    IPaginationDTO,
    ITransportRouteDeleteRs,
    ITransportRouteFinalRq,
    ITransportRouteFinalRs,
    ITransportRouteListDTO,
    ITransportRouteListRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { RouteStationComponent } from './station/route-station.component';
import { RouteUpdateComponent } from './update/route-update.component';
import { RouteCopyComponent } from './copy/route-copy.component';
import { RouteFinalComponent } from './final/route-final.component';

@Component({
    host: { selector: 'route' },
    templateUrl: './route.component.html',
    styleUrls: ['./route.component.scss'],
    standalone: false
})
export class RouteComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مسیرها',
        toolbar: { route: ['/route'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [
            { type: 'CREATE', title: 'ثبت مسیر', action: () => this.station('SAVE') },
            { title: 'محاسبه مسیر', icon: 'route', action: () => this.station('CREATE'), color: 'primary' },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public routes: ITransportRouteListDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ITransportRouteListDTO> = {
        type: 'مسیر',
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/route', 'map', data.id] },
            { title: 'نهایی', value: 'key', english: true, isDescription: true },
            { title: 'ثبت', value: 'date', type: 'DATE' },
            { title: 'مسیر', value: (data) => data.count.path, type: 'NUMBER' },
            { title: 'ایستگاه', value: (data) => data.count.center, type: 'NUMBER' },
            { title: 'مکان', value: (data) => data.count.location, type: 'NUMBER' },
            { title: 'مسافر', value: (data) => data.count.passenger, type: 'NUMBER' },
        ],
        actions: [
            { title: 'مشاهده نقشه', icon: 'map', action: (data: ITransportRouteListDTO) => ['/route', 'map', data.id] },
            {
                title: 'مسیر نهایی',
                icon: 'done_all',
                action: this.final.bind(this),
                color: 'warn',
                hideOn: (data) => !data.final,
            },
            { title: 'مسیر نهایی', icon: 'done_all', action: this.final.bind(this), hideOn: (data) => data.final },
            'DIVIDER',
            { title: 'کپی', icon: 'file_copy', action: this.copy.bind(this) },
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

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ITransportRouteListRs>('TransportRouteList', { params: { query, page } }, (response) => {
            this.routes = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    station(action: 'CREATE' | 'SAVE'): void {
        const stations: IOptionDTO[] = this.activatedRoute.snapshot.data['stations'];
        this.ngxHelperBottomSheetService.open(RouteStationComponent, 'انتخاب ایستگاه', { data: { stations, action } });
    }

    copy(route: ITransportRouteListDTO): void {
        this.ngxHelperBottomSheetService.open(RouteCopyComponent, 'کپی مسیر', { data: { route } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('مسیر با موفقیت کپی شد.');
        });
    }

    update(route: ITransportRouteListDTO): void {
        this.ngxHelperBottomSheetService.open(RouteUpdateComponent, 'ویرایش مسیر', { data: { route } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('مسیر با موفقیت ویرایش شد.');
        });
    }

    delete(route: ITransportRouteListDTO): void {
        const item: string = 'مسیر';
        const title: string = route.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = route.id;
            this.apiService.request<ITransportRouteDeleteRs>('TransportRouteDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('مسیر با موفقیت حذف شد.');
            });
        });
    }

    final(route: ITransportRouteListDTO): void {
        if (!route.final) {
            if (route.emptyCenter) {
                this.ngxHelperToastService.error(
                    'امکان ثبت مسیرهایی که ایستگاه استفاده نشده در مسیر در آنها ثبت شده است به عنوان مسیر نهایی وجود ندارد.',
                );
                return;
            }

            this.ngxHelperBottomSheetService.open(RouteFinalComponent, 'ثبت در مسیرهای نهایی', { data: { route } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('مسیر با موفقیت در لیست مسیرهای نهایی ثبت شد.');
            });
        } else {
            const title: string = 'مسیر';
            const question: string = 'آیا می‌خواهید مسیر را از لیست مسیرهای نهایی شده حذف کنید؟';
            const message: string =
                'در صورت تایید، اطلاعات مسیر در سیستم باقی می‌ماند اما مسیر از لیست مسیرهای نهایی حذف می‌شود.';

            this.ngxHelperConfirmService.delete(title, { question, title: route.title, message }, () => {
                const ID: string = route.id;
                const body: ITransportRouteFinalRq = { key: route.key || '?' };
                this.apiService.request<ITransportRouteFinalRs>('TransportRouteFinal', { body, ids: { ID } }, () => {
                    this.loadList();
                    this.ngxHelperToastService.success('مسیر با موفقیت از لیست مسیرهای نهایی حذف شد.');
                });
            });
        }
    }
}
