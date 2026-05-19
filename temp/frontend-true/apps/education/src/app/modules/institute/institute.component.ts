import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IEducationInstituteDTO,
    IEducationInstituteDeleteRs,
    IEducationInstituteListRs,
    IEducationInstituteStatusRq,
    IEducationInstituteStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { InstituteCreateComponent } from './create/institute-create.component';
import { InstituteUpdateComponent } from './update/institute-update.component';

@Component({
    host: { selector: 'institute' },
    templateUrl: './institute.component.html',
    styleUrl: './institute.component.scss',
    standalone: false
})
export class InstituteComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت موسسه‌ها',
        toolbar: { route: ['/institute'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [{ type: 'CREATE', title: 'ثبت موسسه', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public institutes: IEducationInstituteDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationInstituteDTO> = {
        type: 'موسسه',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'مدیرعامل', value: (data) => data.ceo.name, description: (data) => data.ceo.mobile },
            { title: 'معرف', value: (data) => data.introducer.name, description: (data) => data.introducer.mobile },
            { title: 'تعداد دوره‌ها', value: 'study', type: 'NUMBER' },
            { title: 'مدت دوره‌ها', value: 'duration', type: 'DURATION' },
            { title: 'شرکت‌کننده', value: 'participant', type: 'NUMBER' },
            { title: 'نفر / ساعت', value: 'hour', type: 'NUMBER' },
            { title: 'مجموع هزینه‌ها', value: (data) => data.expense.total, type: 'PRICE' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    public menu: NgxHelperListMenu<IEducationInstituteDTO>[] = [];

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
        this.apiService.request<IEducationInstituteListRs>(
            'EducationInstituteList',
            { params: { query, page } },
            (response) => {
                this.institutes = response.list;
                this.pagination = response.pagination;
                this.loading = false;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(InstituteCreateComponent, 'ثبت موسسه جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('موسسه با موفقیت ثبت شد.');
        });
    }

    status(institute: IEducationInstituteDTO, active: boolean): void {
        const item: string = 'موسسه';
        const title: string = institute.title;
        const message: string = active
            ? 'پس از فعال کردن موسسه امکان انتخاب موسسه برای برگزاری دوره جدید وجود دارد.'
            : 'در صورت تایید، اطلاعات موسسه در سیستم باقی خواهد ماند اما امکان انتخاب موسسه برای برگزاری دوره جدید وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = institute.id;
            const body: IEducationInstituteStatusRq = { active };
            this.apiService.request<IEducationInstituteStatusRs>('EducationInstituteStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`موسسه با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(institute: IEducationInstituteDTO): void {
        this.ngxHelperBottomSheetService.open(InstituteUpdateComponent, 'ویرایش موسسه', { data: { institute } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('موسسه با موفقیت ویرایش شد.');
        });
    }

    delete(institute: IEducationInstituteDTO): void {
        const item: string = 'موسسه';
        const title: string = institute.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = institute.id;
            this.apiService.request<IEducationInstituteDeleteRs>('EducationInstituteDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('موسسه با موفقیت حذف شد.');
            });
        });
    }
}
