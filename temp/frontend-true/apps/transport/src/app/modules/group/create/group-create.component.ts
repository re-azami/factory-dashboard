import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportGroupCreateRq, ITransportGroupCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'group-create' },
    templateUrl: './group-create.component.html',
    styleUrls: ['./group-create.component.scss'],
    standalone: false
})
export class GroupCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت گروه مکان جدید',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان' }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ITransportGroupCreateRq = {
            title: values['title'],
        };
        this.apiService.request<ITransportGroupCreateRs>('TransportGroupCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
