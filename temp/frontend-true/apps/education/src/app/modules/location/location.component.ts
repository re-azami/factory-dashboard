import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IEducationLocationDTO,
    IEducationLocationDeleteRs,
    IEducationLocationListRs,
    IEducationLocationStatusRq,
    IEducationLocationStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LocationCreateComponent } from './create/location-create.component';
import { LocationUpdateComponent } from './update/location-update.component';

@Component({
    host: { selector: 'location' },
    templateUrl: './location.component.html',
    styleUrl: './location.component.scss',
    standalone: false
})
export class LocationComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت فضاهای آموزشی',
        toolbar: { route: ['/location'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [{ type: 'CREATE', title: 'ثبت فضای آموزشی', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public locations: IEducationLocationDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationLocationDTO> = {
        type: 'فضای آموزشی',
        description: (data) => data.description,
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'بررسی زمانبندی', value: (data) => (data.availability ? 'فعال' : 'غیرفعال') },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    public menu: NgxHelperListMenu<IEducationLocationDTO>[] = [];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IEducationLocationListRs>(
            'EducationLocationList',
            { params: { query, page } },
            (response) => {
                this.locations = response.list;
                this.pagination = response.pagination;
                this.loading = false;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(LocationCreateComponent, 'ثبت فضای آموزشی جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('فضای آموزشی با موفقیت ثبت شد.');
        });
    }

    status(location: IEducationLocationDTO, active: boolean): void {
        const item: string = 'فضای آموزشی';
        const title: string = location.title;
        const message: string = active
            ? 'پس از فعال کردن فضای آموزشی امکان انتخاب فضای آموزشی برای برگزاری دوره جدید وجود دارد.'
            : 'در صورت تایید، اطلاعات فضای آموزشی در سیستم باقی خواهد ماند اما امکان انتخاب فضای آموزشی برای برگزاری دوره جدید وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = location.id;
            const body: IEducationLocationStatusRq = { active };
            this.apiService.request<IEducationLocationStatusRs>('EducationLocationStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`فضای آموزشی با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(location: IEducationLocationDTO): void {
        this.ngxHelperBottomSheetService.open(LocationUpdateComponent, 'ویرایش فضای آموزشی', { data: { location } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('فضای آموزشی با موفقیت ویرایش شد.');
        });
    }

    delete(location: IEducationLocationDTO): void {
        const item: string = 'فضای آموزشی';
        const title: string = location.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = location.id;
            this.apiService.request<IEducationLocationDeleteRs>('EducationLocationDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('فضای آموزشی با موفقیت حذف شد.');
            });
        });
    }
}
