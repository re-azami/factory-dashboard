import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationExpenseDeleteRs,
    IEducationExpenseDTO,
    IEducationExpenseListRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';
import {
    EducationExpense,
    EducationExpenseInfo,
    EducationExpenseList,
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
} from '@lib/shared';

import { EducationStudyService } from '../../../../providers';

import { StudyActiveExpenseEducatorComponent } from './educator/study-active-expense-educator.component';
import { StudyActiveExpenseCreateComponent } from './create/study-active-expense-create.component';
import { StudyActiveExpenseUpdateComponent } from './update/study-active-expense-update.component';

@Component({
    selector: 'study-active-expense',
    templateUrl: './study-active-expense.component.html',
    styleUrl: './study-active-expense.component.scss',
    standalone: false
})
export class StudyActiveExpenseComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    @Output() updated: EventEmitter<IEducationStudyDTO> = new EventEmitter<IEducationStudyDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = [{ title: 'ویرایش هزینه برگزاری', icon: 'edit', action: this.educator.bind(this) }];
    public menu: NgxHelperMenu[] = [
        ...ExportTypeList.map((type: ExportType) => ({
            icon: ExportTypeInfo[type].icon,
            title: `دانلود لیست ${ExportTypeInfo[type].title}`,
            click: () => this.export(type),
            disableOn: () => this.study.expense.total === 0,
        })),
        'DIVIDER',
        ...EducationExpenseList.map((expense: EducationExpense) => ({
            title: `ثبت هزینه ${EducationExpenseInfo[expense].title}`,
            click: () => this.create(expense),
        })),
    ];

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
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    private pricePipe = new NgxHelperPricePipe().transform;

    constructor(
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
                { title: 'جمع هزینه‌ها', value: this.pricePipe(this.study.expense.total) },
            ],
            [
                { title: 'هزینه برگزاری', value: this.pricePipe(this.study.expense.educator) },
                { title: 'سایر هزینه‌ها', value: this.pricePipe(this.study.expense.extra) },
            ],
        ];
    }

    loadList(): void {
        const STUDYID: string = this.study.id;
        this.apiService.request<IEducationExpenseListRs>('EducationExpenseList', { ids: { STUDYID } }, (response) => {
            this.loading = false;
            this.expenses = response.list;

            this.setStudy(response.study);
        });
    }

    educator(): void {
        this.ngxHelperBottomSheetService.open<IEducationStudyDTO>(
            StudyActiveExpenseEducatorComponent,
            'ویرایش هزینه برگزاری دوره',
            { data: { study: this.study } },
            (response) => {
                this.setStudy(response);
                this.ngxHelperToastService.success('تغییر هزینه برگزاری با موفقیت ثبت شد.');
            },
        );
    }

    create(type: EducationExpense): void {
        this.ngxHelperBottomSheetService.open<IEducationStudyDTO>(
            StudyActiveExpenseCreateComponent,
            `ثبت هزینه ${EducationExpenseInfo[type].title}`,
            { data: { study: this.study, type } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('هزینه با موفقیت ثبت شد.');
            },
        );
    }

    update(expense: IEducationExpenseDTO): void {
        this.ngxHelperBottomSheetService.open(
            StudyActiveExpenseUpdateComponent,
            `ویرایش هزینه ${EducationExpenseInfo[expense.type].title}`,
            { data: { study: this.study, expense } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('هزینه با موفقیت ویرایش شد.');
            },
        );
    }

    delete(expense: IEducationExpenseDTO): void {
        const item = `هزینه ${EducationExpenseInfo[expense.type].title}`;
        const title = new NgxHelperPricePipe().transform(expense.expense, { currency: 'تومان' });
        this.ngxHelperConfirmService.delete(item, { title }, () => {
            const STUDYID: string = this.study.id;
            const ID: string = expense.id;
            this.apiService.request<IEducationExpenseDeleteRs>('EducationExpenseDelete', { ids: { STUDYID, ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('هزینه با موفقیت حذف شد.');
            });
        });
    }

    export(type: ExportType): void {
        if (this.study.participant.count === 0) return;

        this.educationStudyService.exportStudyExpense(this.study, type);
    }
}
