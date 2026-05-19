import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, IEducationInstituteFullRs, IOptionDTO } from '@lib/apis';

@Component({
    host: { selector: 'select-institute' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './select-institute.component.html',
    styleUrl: './select-institute.component.scss'
})
export class SelectInstituteComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'انتخاب موسسه',
        inputs: [],
    };

    public loading: boolean = true;
    public institutes: IOptionDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { current?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IEducationInstituteFullRs>('EducationInstituteFull', (response) => {
            this.loading = false;
            this.institutes = response;

            this.ngxForm.inputs = [
                { name: 'institute', type: 'SELECT', title: 'موسسه', options: response, value: this.data.current },
            ];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const institute = this.institutes.find((i) => i.id === values['institute']);
        if (institute) this.ngxHelperBottomSheetService.close(institute);
    }
}
