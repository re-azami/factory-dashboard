import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoUpdatePaymentRq, ILoadCargoUpdatePaymentRs } from '@lib/apis';

@Component({
    selector: 'cargo-update-payment',
    templateUrl: './cargo-update-payment.component.html',
    styleUrl: './cargo-update-payment.component.scss',
    standalone: false
})
export class CargoUpdatePaymentComponent implements OnInit {
    @Input({ required: true }) cargo!: ILoadCargoDTO;

    @Output() updated: EventEmitter<ILoadCargoDTO> = new EventEmitter<ILoadCargoDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش مشخصات حمل بار',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        name: 'truck',
                        type: 'SELECT',
                        title: 'مدیریت ناوگان',
                        options:
                            this.cargo.type === 'IN' || this.cargo.type === 'SITE'
                                ? [{ id: 'ON', title: 'فقط ناوگان ثبت شده در سیستم' }]
                                : [
                                      { id: 'ON', title: 'فقط ناوگان ثبت شده در سیستم' },
                                      { id: 'OFF', title: 'فقط ناوگانی که در سیستم ثبت نشده اند' },
                                      { id: 'BOTH', title: 'بدون محدودیت' },
                                  ],
                        value: this.cargo.truck || 'BOTH',
                        description: 'امکان استفاده از سیستم پرداخت فقط برای ناوگان ثبت شده در سیستم وجود دارد.',
                    },
                ],
            },
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'payment',
                                type: 'CHECKBOX',
                                message: 'استفاده از سیستم پرداخت هزینه حمل',
                                value: this.cargo.payment,
                                description: 'اطلاعات حواله‌های مرتبط با بار در گزارش هزینه حمل بار در نظر گرفته می‌شود.',
                                disableOn: (value: INgxFormValues) => value['truck'] !== 'ON',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'price',
                                type: 'NUMBER',
                                title: 'هزینه حمل',
                                value: this.cargo.price,
                                suffix: 'ریال',
                                description: 'هر کیلوگرم',
                                disableOn: (value: INgxFormValues) => value['truck'] !== 'ON' || !value['payment'],
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'update',
                                type: 'CHECKBOX',
                                message: 'اعمال تغییرات در حواله‌های قبلی',
                                description:
                                    'با انتخاب این گزینه و مشخص کردن تاریخ، می‌توانید هزینه حمل حواله‌های مرتبط با بار را تغییر دهید. ' +
                                    'در این حالت، هزینه حمل حواله‌هایی که از تاریخ مشخص شده به بعد در سیستم ثبت شده باشند به هزینه حمل جدید تغییر خواهد کرد.',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'date',
                                type: 'DATE',
                                title: 'از تاریخ',
                                maxDate: new Date(),
                                disableOn: (value: INgxFormValues) => !value['update'],
                                description:
                                    'در دو حالت زیر، اطلاعات هزینه حمل حواله‌ها تغییر داده نخواهد شد:\n' +
                                    '۱ - حواله‌هایی که پرداخت برای آنها ثبت شده است.\n' +
                                    '۲ - حواله‌هایی که مالک ناوگان مرتبط با آنها در سیستم ثبت نشده است.',
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        optional: true,
                        description: 'توضیحات در گزارش تغییرات بار نمایش داده می‌شود.',
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.cargo.id;
        const body: ILoadCargoUpdatePaymentRq = {
            truck: values['truck'] === 'BOTH' ? null : values['truck'],
            payment: values['truck'] === 'ON' && !!values['payment'],
            price: values['truck'] === 'ON' && !!values['payment'] ? values['price'] : null,
            update: values['update'] ? values['date'] : null,
            description: values['description'],
        };

        this.apiService.request<ILoadCargoUpdatePaymentRs>('LoadCargoUpdatePayment', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مشخصات حمل بار با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
