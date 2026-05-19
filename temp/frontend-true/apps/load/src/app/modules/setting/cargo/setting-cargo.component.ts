import { Component, HostBinding, Input, OnInit } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadSettingCreateRq, ILoadSettingCreateRs, ILoadSettingDTO, ILoadSettingInfoRs } from '@lib/apis';
import { AccessInfo, LoadCargo, LoadCargoInfo, LoadFlowInfo } from '@lib/shared';

import { LoadSettingService } from '../../../providers';

@Component({
    selector: 'setting-cargo',
    templateUrl: './setting-cargo.component.html',
    styleUrl: './setting-cargo.component.scss',
    standalone: false,
})
export class SettingCargoComponent implements OnInit {
    @HostBinding('style.--ngxFormIconSize') ngxFormIconSize: string = '16px !important';
    @Input({ required: true }) cargo!: LoadCargo;

    public loading: boolean = true;
    public setting!: ILoadSettingDTO;
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت تنظیمات بار',
        sections: [],
    };

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        const cargo: LoadCargo = this.cargo;
        this.apiService.request<ILoadSettingInfoRs>('LoadSettingInfo', { params: { cargo } }, (response) => {
            this.loading = false;
            this.setting = response;

            this.ngxForm.submit = `ثبت تنظیمات بار ${LoadCargoInfo[this.cargo].title}`;
            this.ngxForm.sections = [
                {
                    columns: [
                        {
                            title: 'تنظیمات بار',
                            inputs: [
                                {
                                    name: 'approximate',
                                    type: 'CHECKBOX',
                                    message: 'نمایش تعداد تقریبی حواله‌های باقیمانده',
                                    value: response.approximate,
                                    description:
                                        'در صورت فعال کردن این گزینه، تعداد تقریبی حواله‌های باقیمانده تا پایان بار، با توجه به متوسط وزن حواله‌های قبلی مرتبط با بار ' +
                                        'محاسبه شده و در هنگام ثبت حواله جدید نمایش داده می‌شود. این گزینه فقط حالت نمایشی داشته و تاثیری در ثبت حواله ندارد.',
                                },
                            ],
                        },
                        {
                            title: 'تنظیمات حواله',
                            inputs: [
                                {
                                    name: 'expire',
                                    type: 'NUMBER',
                                    title: 'مدت زمان غیرفعال شدن حواله',
                                    value: response.expire,
                                    minimum: 1,
                                    suffix: 'ساعت',
                                    description:
                                        'در صورتی که فرآیند حواله در مدت مشخص شده به پایان نرسد، حواله به صورت غیرفعال فرض شده و امکان ایجاد تغییر در آن وجود ندارد. ',
                                    optional: true,
                                },
                                {
                                    name: 'cancel',
                                    type: 'NUMBER',
                                    title: 'مدت زمان لغو اتوماتیک حواله',
                                    value: response.cancel,
                                    optional: true,
                                    minimum: 1,
                                    suffix: 'ساعت',
                                    description:
                                        'در صورتی که فرآیند حواله در مدت مشخص شده به پایان نرسد، حواله به صورت اتوماتیک لغو می‌شود. گزارش مربوط به لغو اتوماتیک حواله در ' +
                                        'بخش گزارش تغییرات حواله ثبت می‌شود. در صورتی که مقداری برای این گزینه مشخص نشود، سیستم لغو اتوماتیک حواله غیرفعال می‌شود. لغو اتوماتیک ' +
                                        'حواله فقط قبل از مرحله بارگیری انجام می‌شود و در صورتی که فرایند بارگیری برای حواله ثبت شده باشد، حواله به صورت اتوماتیک لغو نخواهد شد.',
                                },
                                {
                                    name: 'block',
                                    type: 'CHECKBOX',
                                    message: 'غیرفعال شدن ناوگان مربوط به حواله‌های لغو اتوماتیک',
                                    value: response.block,
                                    description:
                                        'در صورت انتخاب این گزینه، در حالتی که - با توجه به تنظیمات قبلی - حواله‌ای در سیستم به صورت اتوماتیک لغو شود، ناوگان مربوط به حواله نیز ' +
                                        'به صورت اتوماتیک غیرفعال خواهد شد و تا زمانی که ناوگان مجددا فعال نشود، امکان ثبت حواله جدید برای آن وجود نخواهد داشت.',
                                },
                                {
                                    name: 'draftParty',
                                    type: 'CHECKBOX',
                                    message: 'نمایش عنوان طرف حساب به عنوان صادر کننده حواله',
                                    value: response.draftParty,
                                    description:
                                        'در صورت انتخاب این گزینه، عنوان طرف حساب مربوط به بار، به عنوان صادر کننده حواله در بالای حواله‌های مرتبط با بار ' +
                                        '- بجای عبارت شرکت بین‌المللی اسمیران - نمایش داده می‌شود. در این حالت شرکت اسمیران به عنوان طرف حساب نمایش داده خواهد شد.',
                                },
                            ],
                        },
                    ],
                },
            ];

            LoadCargoInfo[this.cargo].steps.forEach((step, index) => {
                this.ngxForm.sections.push({
                    title: index === 0 ? 'تنظیمات مراحل فرایند' : undefined,
                    columns: [
                        { inputs: [{ type: 'COMMENT', title: 'مرحله', value: step.title }] },
                        {
                            inputs: [
                                { type: 'COMMENT', title: 'دسترسی', value: AccessInfo[LoadFlowInfo[step.flow].role].title },
                            ],
                        },
                        {
                            inputs: [
                                {
                                    name: `status_${step.id}`,
                                    type: 'SELECT',
                                    title: 'وضعیت',
                                    value: this.loadSettingService.getStep(step.id, response).status,
                                    options: step.canDeactive
                                        ? [
                                              { id: 'ACTIVE', title: 'فعال' },
                                              { id: 'DEACTIVE', title: 'غیرفعال' },
                                          ]
                                        : [{ id: 'ACTIVE', title: 'فعال' }],
                                    disableOn: () => !step.canDeactive,
                                },
                            ],
                        },
                        {
                            inputs: [
                                {
                                    name: `delay_${step.id}`,
                                    type: 'NUMBER',
                                    title: `زمان تاخیر`,
                                    value: this.loadSettingService.getStep(step.id, response).delay,
                                    suffix: 'دقیقه',
                                    text: 'MINUTE',
                                    optional: true,
                                    minimum: 1,
                                    disableOn: (values) => index === 0 || values[`status_${step.id}`] === 'DEACTIVE',
                                },
                            ],
                        },
                    ],
                });
            });
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadSettingCreateRq = {
            cargo: this.cargo,
            approximate: values['approximate'],
            expire: values['expire'],
            cancel: values['cancel'],
            block: !!values['block'],
            draftParty: !!values['draftParty'],
            steps: LoadCargoInfo[this.cargo].steps.map((step) => ({
                step: step.id,
                status: values[`status_${step.id}`] || 'ACTIVE',
                delay: values[`delay_${step.id}`] || null,
            })),
        };
        this.apiService.request<ILoadSettingCreateRs>('LoadSettingCreate', { body }, () =>
            this.ngxHelperToastService.success('تنظیمات نوع بار با موفقیت ثبت شد.'),
        );
    }
}
