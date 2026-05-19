import { Component, EventEmitter, Input, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckDTO, ILoadTruckUpdateOwnerRq, ILoadTruckUpdateOwnerRs, IOptionDTO } from '@lib/apis';

@Component({
    selector: 'truck-update-owner',
    templateUrl: './truck-update-owner.component.html',
    styleUrl: './truck-update-owner.component.scss',
    standalone: false
})
export class TruckUpdateOwnerComponent {
    @Input({ required: true }) truck!: ILoadTruckDTO;
    @Input({ required: true }) owners!: IOptionDTO[];

    @Output() updated: EventEmitter<ILoadTruckDTO> = new EventEmitter<ILoadTruckDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر مالک ناوگان',
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
                            {
                                name: 'owner',
                                type: 'SELECT',
                                title: 'مالک',
                                value: this.truck.owner.id,
                                options: this.owners,
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
                                    'با انتخاب این گزینه و مشخص کردن تاریخ، می‌توانید مالک حواله‌های مرتبط با ناوگان را تغییر دهید. ' +
                                    'در این حالت، مالک حواله‌هایی که از تاریخ مشخص شده به بعد در سیستم ثبت شده باشند به مالک جدید تغییر خواهد کرد.',
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
        if (values['owner'] === this.truck.owner.id) {
            this.ngxHelperToastService.error('مقدار مالک تغییر داده نشده است.');
            return;
        }

        const ID: string = this.truck.id;
        const body: ILoadTruckUpdateOwnerRq = {
            owner: values['owner'],
            update: values['update'] ? values['date'] : null,
            description: values['description'],
        };

        this.apiService.request<ILoadTruckUpdateOwnerRs>('LoadTruckUpdateOwner', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مالک ناوگان با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
