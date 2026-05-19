import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoActivationCreateRq,
    ILoadCargoActivationCreateRs,
    ILoadCargoActivationDeleteRs,
    ILoadCargoActivationListRs,
    ILoadCargoDTO,
} from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'cargo-activation',
    templateUrl: './cargo-activation.component.html',
    styleUrl: './cargo-activation.component.scss',
    standalone: false
})
export class CargoActivationComponent implements OnInit {
    @Input({ required: true }) cargo!: ILoadCargoDTO;

    @Output() updated: EventEmitter<ILoadCargoDTO> = new EventEmitter<ILoadCargoDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public loading: boolean = true;
    public blocks: IPageBlock[][] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت فعال سازی اتوماتیک',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(
        private readonly apiService: ApiService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

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

        const ID: string = this.cargo.id;
        this.apiService.request<ILoadCargoActivationListRs>('LoadCargoActivationList', { ids: { ID } }, (response) => {
            this.loading = false;

            this.ngxForm.sections = [
                {
                    columns: [
                        {
                            name: 'prior',
                            type: 'SELECT',
                            title: 'بار پیشین',
                            value: this.cargo.prior?.id,
                            options: response
                                .filter((r) => r.id !== this.cargo.id)
                                .map((r) => ({ id: r.id, title: r.title })),
                            description:
                                'این لیست فقط شامل بارهایی است که تناژ و ثبت پایان بار اتوماتیک برای آنها فعال شده است. ' +
                                '\n' +
                                `پس از ثبت پایان بار به صورت اتوماتیک برای این بار، بار ${this.cargo.title} به صورت اتوماتیک فعال خواهد شد.`,
                        },
                    ],
                },
            ];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.cargo.status !== 'FUTURE') return;

        if (this.cargo.prior?.id === values['prior']) {
            this.ngxHelperToastService.error('بار پیشین تغییر داده نشده است.');
            return;
        }

        const ID: string = this.cargo.id;
        const body: ILoadCargoActivationCreateRq = { prior: values['prior'] };
        this.apiService.request<ILoadCargoActivationCreateRs>(
            'LoadCargoActivationCreate',
            { body, ids: { ID } },
            (response) => {
                this.ngxHelperToastService.success('فعال سازی اتوماتیک بار با موفقیت ویرایش شد.');
                this.updated.emit(response);
            },
        );
    }

    delete(): void {
        if (!this.cargo.prior) return;

        const item: string = 'فعال سازی اتوماتیک';
        const title: string = this.cargo.prior.title;

        this.ngxHelperConfirmService.delete(item, { title }, () => {
            const ID: string = this.cargo.id;
            this.apiService.request<ILoadCargoActivationDeleteRs>(
                'LoadCargoActivationDelete',
                { ids: { ID } },
                (response) => {
                    this.ngxHelperToastService.success('فعال سازی اتوماتیک بار با موفقیت لغو شد.');
                    this.updated.emit(response);
                },
            );
        });
    }
}
