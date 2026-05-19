import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, ISharedPersonnelMemberDTO, ISharedPersonnelMemberListRs } from '@lib/apis';

@Component({
    host: { selector: 'select-participant' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './select-participant.component.html',
    styleUrl: './select-participant.component.scss'
})
export class SelectParticipantComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'انتخاب شرکت‌کننده',
        inputs: [],
    };

    public loading: boolean = true;
    public participants: ISharedPersonnelMemberDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { current?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<ISharedPersonnelMemberListRs>('SharedPersonnelMemberList', (response) => {
            this.loading = false;
            this.participants = response;

            this.ngxForm.inputs = [
                {
                    name: 'participant',
                    type: 'SELECT',
                    title: 'شرکت‌کننده',
                    options: response.map((r) => ({ id: r.id, title: `${r.name.first} ${r.name.last}` })),
                    value: this.data.current,
                },
            ];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const participant = this.participants.find((p) => p.id === values['participant']);
        if (participant) this.ngxHelperBottomSheetService.close(participant);
    }
}
