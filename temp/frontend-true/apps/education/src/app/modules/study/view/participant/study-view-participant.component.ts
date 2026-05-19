import { Component, Input, OnInit } from '@angular/core';

import { ApiService, IEducationParticipantDTO, IEducationParticipantListRs, IEducationStudyDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationStudyService } from '../../../../providers';

@Component({
    selector: 'study-view-participant',
    templateUrl: './study-view-participant.component.html',
    styleUrl: './study-view-participant.component.scss',
    standalone: false
})
export class StudyViewParticipantComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = ExportTypeList.map((type: ExportType) => ({
        icon: ExportTypeInfo[type].icon,
        title: ExportTypeInfo[type].title,
        action: () => this.export(type),
    }));

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
    };

    constructor(private readonly apiService: ApiService, private readonly educationStudyService: EducationStudyService) {}

    ngOnInit(): void {
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

        const STUDYID: string = this.study.id;
        this.apiService.request<IEducationParticipantListRs>(
            'EducationParticipantList',
            { ids: { STUDYID } },
            (response) => {
                this.loading = false;
                this.participants = response.list;
            },
        );
    }

    export(type: ExportType): void {
        if (this.study.participant.count === 0) return;

        this.educationStudyService.exportStudyParticipant(this.study, type);
    }
}
