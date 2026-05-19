import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadCargoInfoRs,
    ILoadDraftDTO,
    ILoadDraftUpdateTransporterRq,
    ILoadDraftUpdateTransporterRs,
    IOptionDTO,
} from '@lib/apis';

@Component({
    selector: 'draft-update-transporter',
    templateUrl: './draft-update-transporter.component.html',
    styleUrl: './draft-update-transporter.component.scss',
    standalone: false
})
export class DraftUpdateTransporterComponent implements OnInit {
    @Input({ required: true }) draft!: ILoadDraftDTO;
    @Input({ required: true }) transporters: IOptionDTO[] = [];

    @Output() updated: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public loading: boolean = true;
    public cargo?: ILoadCargoDTO;

    public ngxForm: INgxForm = {
        submit: 'ویرایش باربری حواله',
        inputs: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        const ID: string = this.draft.cargo.id;
        this.apiService.request<ILoadCargoInfoRs>(
            'LoadCargoInfo',
            { ids: { ID }, silent: true, loading: false },
            (response) => {
                this.loading = false;
                this.cargo = response;

                this.ngxForm.inputs.push(
                    {
                        name: 'transporter',
                        type: 'SELECT',
                        title: 'باربری',
                        value: this.draft.transporter?.id || undefined,
                        options: this.cargo?.transporter?.transporters || this.transporters,
                        optional: !this.cargo?.transporter?.required,
                    },
                    { name: 'description', type: 'TEXTAREA', title: 'توضیحات' },
                );
            },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if ((!this.draft.transporter && !values['transporter']) || this.draft.transporter?.id === values['transporter']) {
            this.ngxHelperToastService.error('مقدار باربری تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateTransporterRq = {
            transporter: values['transporter'],
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateTransporterRs>(
            'LoadDraftUpdateTransporter',
            { body, ids: { ID } },
            (response) => {
                this.ngxHelperToastService.success('باربری حواله با موفقیت ویرایش شد.');
                this.updated.emit(response);
            },
        );
    }
}
