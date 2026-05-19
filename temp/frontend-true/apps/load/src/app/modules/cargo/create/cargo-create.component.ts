import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoCreateRq, ILoadCargoCreateRs, IOptionDTO, IUploadRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LoadCargo, LoadCargoInfo, LoadCargoList, LoadStatus, LoadStatusInfo, LoadStatusList } from '@lib/shared';

@Component({
    host: { selector: 'cargo-create' },
    templateUrl: './cargo-create.component.html',
    styleUrl: './cargo-create.component.scss',
    standalone: false,
})
export class CargoCreateComponent implements OnInit {
    public title: IPageTitle = {
        title: 'مدیریت بارها',
        description: 'ثبت بار جدید',
        actions: [{ type: 'RETURN', action: ['/cargo'] }],
    };

    public loading: boolean = true;
    public cargo!: LoadCargo;
    public parties: IOptionDTO[] = this.activatedRoute.snapshot.data['parties'];
    public shipments: IOptionDTO[] = this.activatedRoute.snapshot.data['shipments'];
    public transporters: IOptionDTO[] = this.activatedRoute.snapshot.data['transporters'];

    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت بار جدید',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/cargo']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const cargo: LoadCargo = this.activatedRoute.snapshot.params['CARGO'];
        if (LoadCargoList.includes(cargo)) this.cargo = cargo;
        else this.router.navigate(['/cargo']);

        this.loading = false;
        this.title = { ...this.title, description: this.title.description + ' ' + LoadCargoInfo[this.cargo].title };
        this.setForm();
    }

    setForm(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: 'نوع بار',
                                value: LoadCargoInfo[this.cargo].title,
                                description: 'امکان تغییر نوع بار پس از ثبت اطلاعات وجود ندارد.',
                            },
                            { name: 'title', type: 'TEXT', title: 'عنوان' },
                            {
                                name: 'grade',
                                type: 'NUMBER',
                                title: 'عیار',
                                suffix: 'درصد',
                                decimal: true,
                                minimum: 1,
                                maximum: 100,
                                optional: true,
                            },
                            { name: 'tonnage', type: 'NUMBER', title: 'تناژ', suffix: 'تن', optional: true },
                            { name: 'party', type: 'SELECT', title: 'طرف حساب', options: this.parties, optional: true },
                            { name: 'shipment', type: 'SELECT', title: 'محموله', options: this.shipments, optional: true },
                            { name: 'contract', type: 'TEXT', title: 'شماره قرارداد', english: true, optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'truck',
                                type: 'SELECT',
                                title: 'مدیریت ناوگان',
                                options:
                                    this.cargo === 'IN' || this.cargo === 'SITE'
                                        ? [{ id: 'ON', title: 'فقط ناوگان ثبت شده در سیستم' }]
                                        : [
                                              { id: 'ON', title: 'فقط ناوگان ثبت شده در سیستم' },
                                              { id: 'OFF', title: 'فقط ناوگانی که در سیستم ثبت نشده اند' },
                                              { id: 'BOTH', title: 'بدون محدودیت' },
                                          ],
                                description: 'امکان استفاده از سیستم پرداخت فقط برای ناوگان ثبت شده در سیستم وجود دارد.',
                            },
                            {
                                name: 'payment',
                                type: 'CHECKBOX',
                                message: 'استفاده از سیستم پرداخت هزینه حمل',
                                description: 'اطلاعات حواله‌های مرتبط با بار در گزارش هزینه حمل بار در نظر گرفته می‌شود.',
                                disableOn: (value: INgxFormValues) => value['truck'] !== 'ON',
                            },
                            {
                                name: 'price',
                                type: 'NUMBER',
                                title: 'هزینه حمل',
                                suffix: 'ریال',
                                description: 'هر کیلوگرم',
                                disableOn: (value: INgxFormValues) => value['truck'] !== 'ON' || !value['payment'],
                            },
                            {
                                name: 'letter',
                                type: 'FILE',
                                title: 'نامه ترخیص',
                                mimes: ['image/gif', 'image/jpeg', 'image/png', 'application/pdf'],
                                optional: true,
                                description:
                                    'نامه ترخیص باید به فرمت PDF یا تصویر باشد و در گزارش بارهای فعال نمایش داده می‌شود.',
                            },
                            {
                                name: 'status',
                                type: 'SELECT',
                                title: 'وضعیت بار',
                                options: LoadStatusList.map((status: LoadStatus) => ({
                                    id: status,
                                    title: LoadStatusInfo[status].title,
                                })),
                            },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
            this.cargo === 'SITE'
                ? { columns: [] }
                : {
                      title: 'باربری‌های مرتبط',
                      columns: [
                          {
                              inputs: [
                                  {
                                      name: 'transporter-active',
                                      type: 'CHECKBOX',
                                      message: 'فعال بودن سیستم مدیریت باربری‌های مرتبط با حواله‌های بار',
                                  },
                                  {
                                      name: 'transporter-required',
                                      type: 'CHECKBOX',
                                      message: 'انتخاب باربری برای حواله‌های بار الزامی باشد',
                                      disableOn: (value: INgxFormValues) => !value['transporter-active'],
                                  },
                              ],
                          },
                          {
                              inputs: [
                                  {
                                      name: 'transporter',
                                      type: 'MULTI-SELECT',
                                      title: 'باربری‌های مرتبط',
                                      options: this.transporters,
                                      view: 'CHECKBOX',
                                      minCount: 1,
                                      disableOn: (value: INgxFormValues) => !value['transporter-active'],
                                  },
                              ],
                          },
                      ],
                  },
        ];
    }

    upload(file: File): Promise<IUploadRs | null> {
        return new Promise<IUploadRs | null>((resolve) => {
            if (!file) {
                resolve(null);
                return;
            }

            this.apiService.upload('LOAD_LETTER', file, (upload) => resolve(upload));
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        this.upload(values['letter']).then((letter) => {
            const body: ILoadCargoCreateRq = {
                type: this.cargo,
                title: values['title'],
                grade: values['grade'],
                tonnage: values['tonnage'],
                party: values['party'],
                shipment: values['shipment'],
                contract: values['contract'],
                truck: values['truck'] === 'BOTH' ? null : values['truck'],
                payment: values['truck'] === 'ON' && !!values['payment'],
                price: values['truck'] === 'ON' && !!values['payment'] ? values['price'] : null,
                letter,
                description: values['description'],
                status: values['status'],
                transporter: {
                    active: this.cargo !== 'SITE' && values['transporter-active'],
                    required: this.cargo !== 'SITE' && values['transporter-active'] ? values['transporter-required'] : false,
                },
                transporters: this.cargo !== 'SITE' && values['transporter-active'] ? values['transporter'] : [],
            };
            this.apiService.request<ILoadCargoCreateRs>('LoadCargoCreate', { body }, () => {
                this.ngxHelperToastService.success('بار با موفقیت ثبت شد.');
                this.router.navigate(['/cargo']);
            });
        });
    }
}
