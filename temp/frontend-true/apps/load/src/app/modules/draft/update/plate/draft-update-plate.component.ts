import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadCargoInfoRs,
    ILoadDraftDTO,
    ILoadDraftUpdatePlateRq,
    ILoadDraftUpdatePlateRs,
} from '@lib/apis';

@Component({
    selector: 'draft-update-plate',
    templateUrl: './draft-update-plate.component.html',
    styleUrl: './draft-update-plate.component.scss',
    standalone: false
})
export class DraftUpdatePlateComponent implements OnInit {
    @Input({ required: true }) draft!: ILoadDraftDTO;

    @Output() updated: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public loading: boolean = true;
    public cargo?: ILoadCargoDTO;

    public ngxForm: INgxForm = {
        submit: 'ویرایش پلاک حواله',
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
                    { name: 'plate', type: 'PLATE', value: this.draft.plate.split('-') as any, letter: 'ع' },
                    { name: 'description', type: 'TEXTAREA', title: 'توضیحات' },
                );
            },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.draft.plate === values['plate'].join('-')) {
            this.ngxHelperToastService.error('مقدار پلاک تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdatePlateRq = {
            plate: values['plate'].join('-'),
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdatePlateRs>('LoadDraftUpdatePlate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('پلاک حواله با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
