import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import {
    ApiService,
    IEducationParticipantDeleteRs,
    IEducationParticipantDTO,
    IEducationParticipantListRs,
    IEducationStudyDataRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationStudyService } from '../../../../providers';

import { StudyActiveParticipantCreateComponent } from './create/study-active-participant-create.component';
import { StudyActiveParticipantDepartmentComponent } from './department/study-active-participant-department.component';
import { StudyActiveParticipantMaximumComponent } from './maximum/study-active-participant-maximum.component';

@Component({
    selector: 'study-active-participant',
    templateUrl: './study-active-participant.component.html',
    styleUrl: './study-active-participant.component.scss',
    standalone: false
})
export class StudyActiveParticipantComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    @Output() updated: EventEmitter<IEducationStudyDTO> = new EventEmitter<IEducationStudyDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public data: IEducationStudyDataRs = this.activatedRoute.snapshot.data['data'];

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = [{ title: 'ثبت شرکت‌کننده', icon: 'add', action: this.create.bind(this) }];
    public menu: NgxHelperMenu[] = [
        ...ExportTypeList.map((type: ExportType) => ({
            icon: ExportTypeInfo[type].icon,
            title: `دانلود لیست ${ExportTypeInfo[type].title}`,
            click: () => this.export(type),
            disableOn: () => this.study.participant.count === 0,
        })),
        'DIVIDER',
        { icon: 'business', title: 'تغییر واحدهای مرتبط', click: this.department.bind(this) },
        { icon: 'people_alt', title: 'تغییر تعداد شرکت‌کننده', click: this.maximum.bind(this) },
    ];

    public loading: boolean = true;
    public participants: IEducationParticipantDTO[] = [];

    public list: IList<IEducationParticipantDTO> = {
        type: 'شرکت کننده',
        description: (data) =>
            data.presence
                ? [
                      this.study.exam.includes('PRACTICAL') ? `نمره آزمون عملی: ${data.score.practical || '؟'}` : '',
                      this.study.exam.includes('WRITTEN') ? `نمره آزمون کتبی: ${data.score.written || '؟'}` : '',
                      this.study.exam.includes('ORAL') ? `نمره آزمون شفاهی: ${data.score.oral || '؟'}` : '',
                      this.study.exam.includes('ELECTRONIC') ? `نمره آزمون الکترونیکی: ${data.score.electronic || '؟'}` : '',
                      this.study.certificate ? `دریافت گواهینامه: ${data.certificate ? 'بلی' : 'خیر'}` : '',
                  ]
                      .filter((d) => !!d)
                      .join(' - ')
                : '',
        columns: [
            { title: 'شرکت کننده', value: 'name' },
            { title: 'کد پرسنلی', value: 'code', english: true },
            { title: 'واحد', value: (data) => data.department.title },
            { title: 'سمت', value: (data) => data.position.title },
            { title: 'درصد حضور', value: (data) => data.presence, type: 'NUMBER' },
            { title: 'عملکرد کلاسی', value: (data) => data.performance, english: true },
        ],
        actions: [{ type: 'DELETE', action: this.delete.bind(this) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly educationStudyService: EducationStudyService,
    ) {}

    ngOnInit(): void {
        this.setData();
        this.loadList();
    }

    setStudy(study: IEducationStudyDTO): void {
        this.study = study;
        this.setData();

        this.updated.emit(this.study);
    }

    setData(): void {
        this.blocks = [
            [
                { title: 'کد شناسایی', value: this.study.code, english: true },
                { title: 'واحد‌های مرتبط', value: this.study.department.map((d) => d.title).join('، ') || 'همه واحدها' },
            ],
            [
                { title: 'شرکت‌کننده', value: this.study.participant.count },
                { title: 'حداکثر تعداد', value: this.study.participant.maximum },
            ],
        ];
    }

    loadList(): void {
        const STUDYID: string = this.study.id;
        this.apiService.request<IEducationParticipantListRs>(
            'EducationParticipantList',
            { ids: { STUDYID } },
            (response) => {
                this.loading = false;
                this.study = response.study;
                this.participants = response.list;
            },
        );
    }

    create(): void {
        if (this.study.participant.count >= this.study.participant.maximum) {
            this.ngxHelperToastService.error('حداکثر تعداد شرکت کننده در دوره ثبت شده است..');
            return;
        }

        const selected: string[] = this.participants.map((p) => p.id);
        this.ngxHelperBottomSheetService.open<IEducationStudyDTO>(
            StudyActiveParticipantCreateComponent,
            'ثبت شرکت‌کننده',
            { data: { study: this.study, data: this.data, selected }, padding: '0 1rem 1rem 1rem' },
            (response) => {
                this.loadList();
                this.setStudy(response);
                this.ngxHelperToastService.success('شرکت‌کننده با موفقیت ثبت شد.');
            },
        );
    }

    delete(participant: IEducationParticipantDTO): void {
        const item = 'شرکت‌کننده';
        const title = participant.name;
        this.ngxHelperConfirmService.delete(item, { title }, () => {
            const STUDYID: string = this.study.id;
            const ID: string = participant.id;
            this.apiService.request<IEducationParticipantDeleteRs>(
                'EducationParticipantDelete',
                { ids: { STUDYID, ID } },
                (response) => {
                    this.loadList();
                    this.setStudy(response);
                    this.ngxHelperToastService.success('شرکت‌کننده با موفقیت حذف شد.');
                },
            );
        });
    }

    export(type: ExportType): void {
        if (this.study.participant.count === 0) return;

        this.educationStudyService.exportStudyParticipant(this.study, type);
    }

    department(): void {
        this.ngxHelperBottomSheetService.open<IEducationStudyDTO>(
            StudyActiveParticipantDepartmentComponent,
            'تغییر واحدهای مرتبط',
            { data: { study: this.study, data: this.data } },
            (response) => {
                this.setStudy(response);
                this.ngxHelperToastService.success('واحدهای مرتبط با موفقیت ثبت شد.');
            },
        );
    }

    maximum(): void {
        this.ngxHelperBottomSheetService.open<IEducationStudyDTO>(
            StudyActiveParticipantMaximumComponent,
            'تغییر تعداد شرکت‌کننده',
            { data: { study: this.study } },
            (response) => {
                this.setStudy(response);
                this.ngxHelperToastService.success('تعداد شرکت‌کننده با موفقیت ثبت شد.');
            },
        );
    }
}
