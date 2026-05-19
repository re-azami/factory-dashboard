import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckDTO, ILoadTruckUpdatePlateRq, ILoadTruckUpdatePlateRs } from '@lib/apis';

@Component({
    selector: 'truck-update-plate',
    templateUrl: './truck-update-plate.component.html',
    styleUrl: './truck-update-plate.component.scss',
    standalone: false
})
export class TruckUpdatePlateComponent implements OnInit {
    @Input({ required: true }) truck!: ILoadTruckDTO;

    @Output() updated: EventEmitter<ILoadTruckDTO> = new EventEmitter<ILoadTruckDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر پلاک ناوگان',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [{ name: 'plate', type: 'PLATE', value: this.truck.plate.split('-') as any, letter: 'ع' }],
                    },
                    {
                        inputs: [
                            {
                                name: 'update',
                                type: 'CHECKBOX',
                                message: 'اعمال تغییرات در حواله‌های قبلی',
                                description:
                                    'با انتخاب این گزینه و مشخص کردن تاریخ، می‌توانید پلاک حواله‌های مرتبط با ناوگان را تغییر دهید. ' +
                                    'در این حالت، پلاک حواله‌هایی که از تاریخ مشخص شده به بعد در سیستم ثبت شده باشند به پلاک جدید تغییر خواهد کرد.',
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
        if (values['plate'].join('-') === this.truck.plate) {
            this.ngxHelperToastService.error('مقدار پلاک تغییر داده نشده است.');
            return;
        }

        const ID: string = this.truck.id;
        const body: ILoadTruckUpdatePlateRq = {
            plate: values['plate'].join('-'),
            update: values['update'] ? values['date'] : null,
            description: values['description'],
        };

        this.apiService.request<ILoadTruckUpdatePlateRs>('LoadTruckUpdatePlate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('پلاک ناوگان با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
