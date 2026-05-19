import { Component, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { NgxHelperDurationPipe, NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import { ApiService, ILoadCheckoutDeleteRs, ILoadCheckoutDTO, ILoadCheckoutListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

import { CheckoutCreateComponent } from './create/checkout-create.component';
import { CheckoutDownloadComponent } from './download/checkout-download.component';
import { CheckoutPaymentComponent } from './payment/checkout-payment.component';

@Component({
    host: { selector: 'checkout' },
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss',
    standalone: false
})
export class CheckoutComponent implements OnInit {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت پرداخت‌ها',
        toolbar: { route: ['/checkout'] },
        actions: [{ type: 'CREATE', title: 'پرداخت‌ جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public checkouts: ILoadCheckoutDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    private periodPipe = new NgxHelperPeriodPipe();
    private durationPipe = new NgxHelperDurationPipe();

    public list: IList<ILoadCheckoutDTO> = {
        type: 'رسید پرداخت',
        isDeactive: (data) => data.paid,
        icon: (data) => (data.paid ? 'price_check' : 'paid'),
        columns: [
            { title: 'کد رسید', value: 'code', english: true },
            { title: 'وضعیت', value: (data) => (data.paid ? 'پرداخت شده' : 'پرداخت نشده'), isDescription: true },
            {
                title: 'دوره زمانی',
                value: (data) => this.periodPipe.transform({ from: data.date.from, to: data.date.to }),
            },
            {
                title: 'روز',
                value: (data) => this.durationPipe.transform({ from: data.date.from, to: data.date.to }, { format: 'DAY' }),
            },
            { title: 'تعداد بار', value: (data) => data.count.cargo, type: 'NUMBER' },
            { title: 'تعداد مالک', value: (data) => data.count.owner, type: 'NUMBER' },
            { title: 'تعداد حواله', value: (data) => data.count.draft, type: 'NUMBER' },
            { title: 'تناژ', value: 'weight', type: 'NUMBER' },
            { title: 'هزینه حمل', value: 'price', type: 'NUMBER' },
        ],
        actions: [
            { title: 'دانلود لیست', icon: 'download', action: this.download.bind(this) },
            'DIVIDER',
            { title: 'ثبت پرداخت', icon: 'price_check', action: this.payment.bind(this), hideOn: (data) => data.paid },
            { type: 'DELETE', action: this.delete.bind(this), hideOn: (data) => data.paid },
            'DIVIDER',
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LOAD_DATA_LOG' } },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadCheckoutListRs>('LoadCheckoutList', { params: { page } }, (response) => {
            this.loading = false;
            this.checkouts = response.list;
            this.pagination = response.pagination;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(CheckoutCreateComponent, 'ثبت رسید پرداخت', () => {
            this.loadList();
            this.ngxHelperToastService.success('رسید پرداخت با موفقیت ثبت شد.');
        });
    }

    download(checkout: ILoadCheckoutDTO): void {
        this.ngxHelperBottomSheetService.open(CheckoutDownloadComponent, 'دانلود لیست', { data: { checkout } });
    }

    payment(checkout: ILoadCheckoutDTO): void {
        this.ngxHelperBottomSheetService.open(
            CheckoutPaymentComponent,
            'ثبت پرداخت رسید پرداخت',
            { data: { checkout } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('پرداخت رسید پرداخت با موفقیت ثبت شد.');
            },
        );
    }

    delete(checkout: ILoadCheckoutDTO): void {
        const item: string = 'رسید پرداخت';
        const title: string = checkout.code;
        const message: string =
            'در صورت تایید، اطلاعات رسید پرداخت از سیستم حذف شده و وضعیت پرداخت تمام حواله‌های مرتبط با آن تغییر خواهد کرد. ' +
            'در این حالت امکان صدور رسید پرداخت جدید برای حواله‌ها وجود خواهد داشت. ' +
            'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = checkout.id;
            this.apiService.request<ILoadCheckoutDeleteRs>('LoadCheckoutDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('رسید پرداخت با موفقیت حذف شد.');
            });
        });
    }

    log(checkout: ILoadCheckoutDTO): void {
        this.loadToolsService.logData('CHECKOUT', checkout.id);
    }
}
