import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDeactivationRq, ILoadCargoDeactivationRs, ILoadCargoDTO } from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'cargo-deactivation',
    templateUrl: './cargo-deactivation.component.html',
    styleUrl: './cargo-deactivation.component.scss',
    standalone: false
})
export class CargoDeactivationComponent implements OnInit {
    @Input({ required: true }) cargo!: ILoadCargoDTO;

    @Output() updated: EventEmitter<ILoadCargoDTO> = new EventEmitter<ILoadCargoDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public blocks: IPageBlock[][] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت پایان بار اتوماتیک',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.blocks = [
            [
                { title: 'بار', value: this.cargo.title },
                { title: 'نوع بار', value: LoadCargoInfo[this.cargo.type].title },
            ],
            [
                { title: 'طرف حساب', value: this.cargo.party?.title },
                { title: 'محموله', value: this.cargo.shipment?.title },
            ],
        ];

        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'active',
                                type: 'CHECKBOX',
                                value: !!this.cargo.deactivation,
                                message: 'فعال بودن ثبت پایان بار به صورت اتوماتیک',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'weight',
                                type: 'NUMBER',
                                title: 'باقیمانده بار',
                                value: this.cargo.deactivation || undefined,
                                minimum: 1000,
                                suffix: 'کیلو',
                                disableOn: (value) => !value['active'],
                            },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.cargo.id;
        const body: ILoadCargoDeactivationRq = {
            active: values['active'],
            weight: values['weight'],
        };
        this.apiService.request<ILoadCargoDeactivationRs>('LoadCargoDeactivation', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('پایان بار اتوماتیک با موفقیت ثبت شد.');
            this.updated.emit(response);
        });
    }
}
