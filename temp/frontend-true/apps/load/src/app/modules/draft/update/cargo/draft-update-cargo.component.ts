import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadActiveCargoRs, ILoadDraftDTO, ILoadDraftUpdateCargoRq, ILoadDraftUpdateCargoRs } from '@lib/apis';
import { LoadCargo, LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'draft-update-cargo',
    templateUrl: './draft-update-cargo.component.html',
    styleUrl: './draft-update-cargo.component.scss',
    standalone: false
})
export class DraftUpdateCargoComponent implements OnInit {
    @Input({ required: true }) draft!: ILoadDraftDTO;

    @Output() updated: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public loadCargoInfo = LoadCargoInfo;

    public loading: boolean = true;

    public ngxForm: INgxForm = {
        submit: 'ویرایش بار حواله',
        inputs: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        const type: LoadCargo = this.draft.cargo.type;
        this.apiService.request<ILoadActiveCargoRs>(
            'LoadActiveCargo',
            { params: { type }, silent: true, loading: false },
            (response) => {
                this.loading = false;
                this.ngxForm.inputs.push(
                    { name: 'cargo', type: 'SELECT', title: 'بار', value: this.draft.cargo.id, options: response },
                    { name: 'description', type: 'TEXTAREA', title: 'توضیحات' },
                );
            },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.draft.cargo.id === values['cargo']) {
            this.ngxHelperToastService.error('مقدار بار تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateCargoRq = {
            cargo: values['cargo'],
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateCargoRs>('LoadDraftUpdateCargo', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('بار حواله با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
