import { Component, EventEmitter, Input, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckDTO, ILoadTruckUpdateDriverRq, ILoadTruckUpdateDriverRs } from '@lib/apis';

@Component({
    selector: 'truck-update-driver',
    templateUrl: './truck-update-driver.component.html',
    styleUrl: './truck-update-driver.component.scss',
    standalone: false
})
export class TruckUpdateDriverComponent {
    @Input({ required: true }) truck!: ILoadTruckDTO;

    @Output() updated: EventEmitter<ILoadTruckDTO> = new EventEmitter<ILoadTruckDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر راننده ناوگان',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            { name: 'name', type: 'NAME', value: this.truck.driver.name },
                            { name: 'mobile', type: 'MOBILE', title: 'موبایل', value: this.truck.driver.mobile },
                            {
                                name: 'nationalCode',
                                type: 'NATIONAL-CODE',
                                title: 'کدملی',
                                value: this.truck.driver.nationalCode,
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'update',
                                type: 'CHECKBOX',
                                message: 'اعمال تغییرات در حواله‌های قبلی',
                                description:
                                    'با انتخاب این گزینه و مشخص کردن تاریخ، می‌توانید راننده حواله‌های مرتبط با ناوگان را تغییر دهید. ' +
                                    'در این حالت، راننده حواله‌هایی که از تاریخ مشخص شده به بعد در سیستم ثبت شده باشند به راننده جدید تغییر خواهد کرد.',
                            },
                            {
                                name: 'date',
                                type: 'DATE',
                                title: 'از تاریخ',
                                maxDate: new Date(),
                                disableOn: (value: INgxFormValues) => !value['update'],
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
                        description: 'توضیحات در گزارش تغییرات ناوگان نمایش داده می‌شود.',
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.truck.id;
        const body: ILoadTruckUpdateDriverRq = {
            name: values['name'],
            mobile: values['mobile'],
            nationalCode: values['nationalCode'],
            update: values['update'] ? values['date'] : null,
            description: values['description'],
        };

        this.apiService.request<ILoadTruckUpdateDriverRs>('LoadTruckUpdateDriver', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('راننده ناوگان با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
