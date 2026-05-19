import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGroupCreateRq, IKitchenGroupCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'group-create' },
    standalone: false,
    templateUrl: './group-create.component.html',
    styleUrl: './group-create.component.scss',
})
export class GroupCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت گروه جدید',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IKitchenGroupCreateRq = {
            title: values['title'],
        };
        this.apiService.request<IKitchenGroupCreateRs>('KitchenGroupCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
