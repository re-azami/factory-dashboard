import { Component } from '@angular/core';

import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperHttpService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IEducationMentorDTO,
    IEducationMentorDeleteRs,
    IEducationMentorListRs,
    IEducationMentorStatusRq,
    IEducationMentorStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';

import { MentorCreateComponent } from './create/mentor-create.component';
import { MentorUpdateComponent } from './update/mentor-update.component';
import { MentorUploadComponent } from './upload/mentor-upload.component';

@Component({
    host: { selector: 'mentor' },
    templateUrl: './mentor.component.html',
    styleUrl: './mentor.component.scss',
    standalone: false
})
export class MentorComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت مدرس‌ها',
        toolbar: { route: ['/mentor'], params: [{ name: 'query', type: 'SEARCH' }] },
        actions: [{ type: 'CREATE', title: 'ثبت مدرس', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public mentors: IEducationMentorDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationMentorDTO> = {
        type: 'مدرس',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: (data) => `${data.name.first} ${data.name.last}` },
            { title: 'موبایل', value: 'mobile', type: 'MOBILE', copy: (data) => data.mobile, isDescription: true },
            { title: 'کدملی', value: 'nationalCode', type: 'NATIONAL-CODE', copy: (data) => data.nationalCode },
            { title: 'برگزاری', value: 'study', type: 'NUMBER' },
            { title: 'مدت دوره‌ها', value: 'duration', type: 'DURATION' },
            { title: 'شرکت‌کننده', value: 'participant', type: 'NUMBER' },
            { title: 'نفر / ساعت', value: 'hour', type: 'NUMBER' },
            { title: 'مجموع هزینه‌ها', value: (data) => data.expense.total, type: 'PRICE' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { title: 'آپلود فایل رزومه', icon: 'upload', action: this.upload.bind(this) },
            {
                title: 'دانلود فایل رزومه',
                icon: 'download',
                action: this.download.bind(this),
                hideOn: (data) => !data.cv,
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    public menu: NgxHelperListMenu<IEducationMentorDTO>[] = [];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IEducationMentorListRs>('EducationMentorList', { params: { query, page } }, (response) => {
            this.mentors = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(MentorCreateComponent, 'ثبت مدرس جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('مدرس با موفقیت ثبت شد.');
        });
    }

    download(mentor: IEducationMentorDTO): void {
        const path: string = this.configService.getApiUrl(mentor.cv);
        this.ngxHelperHttpService.download(`${mentor.name.first} ${mentor.name.last}`, path);
    }

    upload(mentor: IEducationMentorDTO): void {
        this.ngxHelperBottomSheetService.open(MentorUploadComponent, 'آپلود رزومه مدرس', { data: { mentor } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('رزومه مدرس با موفقیت آپلود شد.');
        });
    }

    status(mentor: IEducationMentorDTO, active: boolean): void {
        const item: string = 'مدرس';
        const title: string = `${mentor.name.first} ${mentor.name.last}`;
        const message: string = active
            ? 'پس از فعال کردن مدرس، امکان انتخاب مدرس برای برگزاری دوره جدید وجود دارد.'
            : 'در صورت تایید، اطلاعات مدرس در سیستم باقی خواهد ماند اما امکان انتخاب مدرس برای برگزاری دوره جدید وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = mentor.id;
            const body: IEducationMentorStatusRq = { active };
            this.apiService.request<IEducationMentorStatusRs>('EducationMentorStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`مدرس با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(mentor: IEducationMentorDTO): void {
        this.ngxHelperBottomSheetService.open(MentorUpdateComponent, 'ویرایش مدرس', { data: { mentor } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('مدرس با موفقیت ویرایش شد.');
        });
    }

    delete(mentor: IEducationMentorDTO): void {
        const item: string = 'مدرس';
        const title: string = `${mentor.name.first} ${mentor.name.last}`;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = mentor.id;
            this.apiService.request<IEducationMentorDeleteRs>('EducationMentorDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('مدرس با موفقیت حذف شد.');
            });
        });
    }
}
