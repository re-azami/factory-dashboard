import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftDTO, ILoadDraftUpdateFinishRq, ILoadDraftUpdateFinishRs } from '@lib/apis';

@Component({
    selector: 'draft-update-finish',
    templateUrl: './draft-update-finish.component.html',
    styleUrl: './draft-update-finish.component.scss',
    standalone: false
})
export class DraftUpdateFinishComponent implements OnInit {
    @Input({ required: true }) draft!: ILoadDraftDTO;

    @Output() updated: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxForm = {
        submit: 'ویرایش تاریخ پایان حواله',
        inputs: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            {
                name: 'finish',
                type: 'DATE',
                title: 'تاریخ پایان',
                value: this.draft.date.finish,
                hour: true,
                maxDate: new Date(),
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات' },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.draft.date.finish.getTime() === values['finish'].getTime()) {
            this.ngxHelperToastService.error('مقدار تاریخ پایان تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateFinishRq = {
            finish: values['finish'],
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateFinishRs>('LoadDraftUpdateFinish', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('تاریخ پایان حواله با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
