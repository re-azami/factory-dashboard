import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IEducationParticipantDTO, IEducationParticipantListRs, IEducationStudyDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';

import { StudyActiveFinishParticipantComponent } from './participant/study-active-finish-participant.component';
import { StudyActiveFinishSaveComponent } from './save/study-active-finish-save.component';

@Component({
    selector: 'study-active-finish',
    templateUrl: './study-active-finish.component.html',
    styleUrl: './study-active-finish.component.scss',
    standalone: false
})
export class StudyActiveFinishComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = [];

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
        actions: [
            {
                title: 'ثبت نتیجه',
                icon: 'task_alt',
                action: this.participant.bind(this),
                hideOn: (data) => data.presence !== null,
            },
            { type: 'UPDATE', action: this.participant.bind(this), hideOn: (data) => data.presence === null },
        ],
    };

    public presenceCount: number = 0;
    public canSave: boolean = false;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.setData();
        this.loadList();
    }

    setData(): void {
        this.blocks = [
            [
                { title: 'کد شناسایی', value: this.study.code, english: true },
                { title: 'حداکثر تعداد', value: this.study.participant.maximum },
            ],
            [
                { title: 'شرکت‌کننده', value: this.study.participant.count },
                { title: 'ثبت نتایج', value: this.loading ? '...' : this.presenceCount },
            ],
        ];

        this.buttons = this.canSave ? [{ title: 'ثبت پایان دوره', icon: 'done_all', action: this.save.bind(this) }] : [];
    }

    loadList(): void {
        const STUDYID: string = this.study.id;
        this.apiService.request<IEducationParticipantListRs>(
            'EducationParticipantList',
            { ids: { STUDYID } },
            (response) => {
                this.loading = false;
                this.participants = response.list.sort((p1, p2) =>
                    p1.presence === null ? (p2.presence === null ? 0 : -1) : 0,
                );

                this.presenceCount = this.participants.reduce((sum: number, p) => sum + (p.presence === null ? 0 : 1), 0);
                this.canSave =
                    this.participants.length !== 0 &&
                    this.presenceCount !== 0 &&
                    this.participants.length === this.presenceCount;
                this.setData();
            },
        );
    }

    participant(participant: IEducationParticipantDTO): void {
        const index: number = this.participants.findIndex((p) => p.id === participant.id);
        const next =
            !!this.participants[index + 1] && this.participants[index + 1].presence === null
                ? { ...this.participants[index + 1] }
                : null;

        this.ngxHelperBottomSheetService.open(
            StudyActiveFinishParticipantComponent,
            'ثبت نتیجه شرکت در دوره',
            { data: { study: this.study, participant } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه شرکت در دوره با موفقیت ثبت شد.');
                if (next) this.participant(next);
            },
        );
    }

    save(): void {
        this.ngxHelperBottomSheetService.open(
            StudyActiveFinishSaveComponent,
            'ثبت پایان دوره',
            { data: { study: this.study } },
            () => {
                this.router.navigate(['/study', 'active']);
                this.ngxHelperToastService.success('پایان دوره با موفقیت ثبت شد.');
            },
        );
    }
}
