import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IEducationStudyDTO, IEducationStudyUnpaidRs, IOptionDTO, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { EducationEducatorInfo } from '@lib/shared';
import { StudyUnpaidPaymentComponent } from './payment/study-unpaid-payment.component';

@Component({
    host: { selector: 'study-unpaid' },
    templateUrl: './study-unpaid.component.html',
    styleUrl: './study-unpaid.component.scss',
    standalone: false
})
export class StudyUnpaidComponent {
    public courses: IOptionDTO[] = this.activatedRoute.snapshot.data['courses'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'دوره‌های پرداخت نشده',
        toolbar: {
            route: ['/study', 'unpaid'],
            params: [{ name: 'course', type: 'SELECT', title: 'دوره', options: this.courses }],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public studies: IEducationStudyDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationStudyDTO> = {
        type: 'دوره پرداخت نشده',
        columns: [
            { title: 'دوره', value: (data) => data.course.title, description: (data) => ({ en: data.code }) },
            {
                title: 'برگزار کننده',
                value: (data) => `${data.educator.title} (${EducationEducatorInfo[data.educator.type].title})`,
            },
            {
                title: 'تاریخ برگزاری',
                value: (data) => this.periodPipe({ from: data.dates[0].date, to: data.dates[data.dates.length - 1].date }),
            },
            { title: 'هزینه برگزاری', value: (data) => data.expense.educator, type: 'PRICE' },
        ],
        actions: [
            {
                title: 'ثبت پرداخت',
                icon: 'paid',
                action: this.payment.bind(this),
                access: { access: 'EDUCATION_ROLE_PAYMENT' },
            },
        ],
    };

    private periodPipe = new NgxHelperPeriodPipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        const course: string = this.params?.params?.['course']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IEducationStudyUnpaidRs>(
            'EducationStudyUnpaid',
            { params: { course, page } },
            (response) => {
                this.loading = false;
                this.studies = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    payment(study: IEducationStudyDTO): void {
        this.ngxHelperBottomSheetService.open(
            StudyUnpaidPaymentComponent,
            'ثبت پرداخت هزینه برگزاری',
            { data: { study } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('پرداخت هزینه برگزاری با موفقیت ثبت شد.');
            },
        );
    }
}
