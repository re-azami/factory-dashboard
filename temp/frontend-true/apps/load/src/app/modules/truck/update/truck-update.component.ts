import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckDTO, ILoadTruckUpdateRq, ILoadTruckUpdateRs } from '@lib/apis';

@Component({
    selector: 'truck-update',
    templateUrl: './truck-update.component.html',
    styleUrl: './truck-update.component.scss',
    standalone: false
})
export class TruckUpdateComponent implements OnInit {
    @Input({ required: true }) truck!: ILoadTruckDTO;

    @Output() updated: EventEmitter<ILoadTruckDTO> = new EventEmitter<ILoadTruckDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش مشخصات ناوگان',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    { inputs: [{ name: 'type', type: 'TEXT', title: 'مدل', value: this.truck.type }] },
                    {
                        inputs: [
                            {
                                name: 'vin',
                                type: 'TEXT',
                                title: 'شماره شاسی',
                                value: this.truck.vin,
                                optional: true,
                                english: true,
                            },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.truck.id;
        const body: ILoadTruckUpdateRq = {
            type: values['type'],
            vin: values['vin'],
        };
        this.apiService.request<ILoadTruckUpdateRs>('LoadTruckUpdate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مشخصات ناوگان با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
