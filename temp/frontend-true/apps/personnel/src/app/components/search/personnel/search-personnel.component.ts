import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelMemberSearchRs, ISharedPersonnelMemberDTO } from '@lib/apis';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

@Component({
    host: { selector: 'search-personnel' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './search-personnel.component.html',
    styleUrl: './search-personnel.component.scss'
})
export class SearchPersonnelComponent {
    public ngxForm: INgxForm = {
        submit: 'جستجوی پرسنل',
        inputs: [
            {
                name: 'query',
                type: 'TEXT',
                title: 'عبارت جستجو',
                autoFocus: true,
                description: 'بخشی از نام یا کد پرسنلی مورد نظر خودتان را وارد کنید.',
            },
        ],
    };

    public isLoaded: boolean = false;
    public loading: boolean = true;
    public members: ISharedPersonnelMemberDTO[] = [];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.loading = true;

        const query: string = values['query'];
        this.apiService.request<IPersonnelMemberSearchRs>('PersonnelMemberSearch', { params: { query } }, (response) => {
            this.isLoaded = true;
            this.loading = false;
            this.members = response;
        });
    }

    select(member: ISharedPersonnelMemberDTO): void {
        this.ngxHelperBottomSheetService.close(member);
    }
}
