import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IEducationCourseDTO,
    IEducationCourseDeleteRs,
    IEducationCourseListRs,
    IEducationCourseStatusRq,
    IEducationCourseStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { CourseCreateComponent } from './create/course-create.component';
import { CourseUpdateComponent } from './update/course-update.component';
import { CourseCodeComponent } from './code/course-code.component';

@Component({
    host: { selector: 'course' },
    templateUrl: './course.component.html',
    styleUrl: './course.component.scss',
    standalone: false
})
export class CourseComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت دوره‌ها',
        toolbar: { route: ['/course'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [{ type: 'CREATE', title: 'ثبت دوره', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public courses: IEducationCourseDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationCourseDTO> = {
        type: 'دوره',
        description: (data) => data.description,
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'کد', value: 'code', english: true, isDescription: true },
            { title: 'برگزاری', value: 'study', type: 'NUMBER' },
            { title: 'مدت دوره‌ها', value: 'duration', type: 'DURATION' },
            { title: 'شرکت‌کننده', value: 'participant', type: 'NUMBER' },
            { title: 'نفر / ساعت', value: 'hour', type: 'NUMBER' },
            { title: 'مجموع هزینه‌ها', value: (data) => data.expense.total, type: 'PRICE' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { title: 'تغییر کد', icon: 'data_array', action: this.code.bind(this) },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    public menu: NgxHelperListMenu<IEducationCourseDTO>[] = [];

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
        this.apiService.request<IEducationCourseListRs>('EducationCourseList', { params: { query, page } }, (response) => {
            this.courses = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(CourseCreateComponent, 'ثبت دوره جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('دوره با موفقیت ثبت شد.');
        });
    }

    status(course: IEducationCourseDTO, active: boolean): void {
        const item: string = 'دوره';
        const title: string = course.title;
        const message: string = active
            ? 'پس از فعال کردن دوره امکان انتخاب دوره برای برگزاری دوره جدید وجود دارد.'
            : 'در صورت تایید، اطلاعات دوره در سیستم باقی خواهد ماند اما امکان انتخاب دوره برای برگزاری دوره جدید وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = course.id;
            const body: IEducationCourseStatusRq = { active };
            this.apiService.request<IEducationCourseStatusRs>('EducationCourseStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`دوره با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(course: IEducationCourseDTO): void {
        this.ngxHelperBottomSheetService.open(CourseUpdateComponent, 'ویرایش دوره', { data: { course } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('دوره با موفقیت ویرایش شد.');
        });
    }

    delete(course: IEducationCourseDTO): void {
        const item: string = 'دوره';
        const title: string = course.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = course.id;
            this.apiService.request<IEducationCourseDeleteRs>('EducationCourseDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('دوره با موفقیت حذف شد.');
            });
        });
    }

    code(course: IEducationCourseDTO): void {
        this.ngxHelperBottomSheetService.open(CourseCodeComponent, 'تغییر کد شناسایی دوره', { data: { course } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('کد شناسایی دوره با موفقیت ویرایش شد.');
        });
    }
}
