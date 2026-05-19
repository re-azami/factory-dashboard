import { Component } from '@angular/core';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILaboratoryMiscDeleteRs, ILaboratoryMiscDTO, ILaboratoryMiscListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { LaboratoryResultInfo } from '@lib/shared';

@Component({
    host: { selector: 'misc' },
    standalone: false,
    templateUrl: './misc.component.html',
    styleUrl: './misc.component.scss',
})
export class MiscComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای متفرقه',
        toolbar: {
            route: ['/misc'],
            params: [],
        },
        actions: this.userService.hasAccess({ access: 'LABORATORY_ROLE_MISC' })
            ? [{ type: 'CREATE', title: 'ثبت نتیجه', action: ['/misc', 'create'] }]
            : [],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public miscs: ILaboratoryMiscDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryMiscDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
            { title: LaboratoryResultInfo['FE'].title, value: (data) => data.fe?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['FEO'].title, value: (data) => data.feo?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['GRIND'].title, value: (data) => data.grind?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['MOISTURE'].title, value: (data) => data.moisture?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['SULPHUR'].title, value: (data) => data.sulphur?.result, type: 'NUMBER' },
            { title: 'ریکاوری', value: (data) => data.recovery?.result, type: 'NUMBER' },
        ],
        description: (data) => data.description,
        actions: this.userService.hasAccess({ access: 'LABORATORY_ROLE_MISC' })
            ? [
                  { type: 'UPDATE', action: (data) => ['/misc', 'update', data.id] },
                  { type: 'DELETE', action: this.delete.bind(this) },
              ]
            : [],
    };

    constructor(
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryMiscListRs>('LaboratoryMiscList', { params: { page } }, (response) => {
            this.loading = false;
            this.miscs = response.list;
            this.pagination = response.pagination;
        });
    }

    delete(misc: ILaboratoryMiscDTO): void {
        const item: string = 'نتیجه آزمایش';
        const title: string = misc.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = misc.id;
            this.apiService.request<ILaboratoryMiscDeleteRs>('LaboratoryMiscDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }
}
