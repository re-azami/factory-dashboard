import { Component, Input, OnInit } from '@angular/core';

import { NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IEducationExpenseDTO, IEducationExpenseListRs, IEducationStudyDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';
import { EducationExpenseInfo, ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationStudyService } from '../../../../providers';

@Component({
    selector: 'study-view-expense',
    templateUrl: './study-view-expense.component.html',
    styleUrl: './study-view-expense.component.scss',
    standalone: false
})
export class StudyViewExpenseComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = ExportTypeList.map((type: ExportType) => ({
        icon: ExportTypeInfo[type].icon,
        title: ExportTypeInfo[type].title,
        action: () => this.export(type),
    }));

    public loading: boolean = true;
    public expenses: IEducationExpenseDTO[] = [];

    public list: IList<IEducationExpenseDTO> = {
        type: 'هزینه',
        description: (data) => data.description,
        columns: [
            { title: 'هزینه', value: (data) => EducationExpenseInfo[data.type].title },
            { title: 'مبلغ', value: 'expense', type: 'PRICE' },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
        ],
    };

    private pricePipe = new NgxHelperPricePipe().transform;

    constructor(private readonly apiService: ApiService, private readonly educationStudyService: EducationStudyService) {}

    ngOnInit(): void {
        this.blocks = [
            [
                { title: 'کد شناسایی', value: this.study.code, english: true },
                { title: 'جمع هزینه‌ها', value: this.pricePipe(this.study.expense.total) },
            ],
            [
                { title: 'هزینه برگزاری', value: this.pricePipe(this.study.expense.educator) },
                { title: 'سایر هزینه‌ها', value: this.pricePipe(this.study.expense.extra) },
            ],
        ];

        const STUDYID: string = this.study.id;
        this.apiService.request<IEducationExpenseListRs>('EducationExpenseList', { ids: { STUDYID } }, (response) => {
            this.loading = false;
            this.expenses = response.list;
        });
    }

    export(type: ExportType): void {
        if (this.study.participant.count === 0) return;

        this.educationStudyService.exportStudyExpense(this.study, type);
    }
}
