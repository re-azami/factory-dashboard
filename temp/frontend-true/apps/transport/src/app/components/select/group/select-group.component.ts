import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, IOptionDTO, ITransportGroupFullRs } from '@lib/apis';

@Component({
    host: { selector: 'select-group' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './select-group.component.html',
    styleUrl: './select-group.component.scss'
})
export class SelectGroupComponent implements OnInit {
    public loading: boolean = true;
    public groups: IOptionDTO[] = [];
    public ngxForm: INgxForm = {
        submit: 'انتخاب گروه مکان',
        inputs: [],
        buttons: [
            {
                title: 'انصراف',
                action: () => {
                    this.router.navigate(['/dashboard']);
                    this.ngxHelperBottomSheetService.close();
                },
            },
        ],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<ITransportGroupFullRs>('TransportGroupFull', (response) => {
            this.loading = false;
            this.groups = response;
            this.ngxForm.inputs = [{ name: 'group', type: 'SELECT', title: 'گروه', options: response }];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const group = this.groups.find((g) => g.id === values['group']);
        if (!group) return;

        this.ngxHelperBottomSheetService.close(group);
    }
}
